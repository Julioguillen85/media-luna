package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

        @Value("${groq.api.key}")
        private String apiKey;

        @Value("${groq.api.url}")
        private String apiUrl;

        @Value("${groq.model}")
        private String model;

        private final RestTemplate restTemplate;

        public GroqService() {
                this.restTemplate = new RestTemplate();
        }

        /**
         * Helper: finds rental price from product list by normalized name
         */
        private String findRentalPrice(List<Map<String, Object>> products, String targetName) {
                if (products == null)
                        return "?";
                String targetNorm = targetName.toLowerCase().trim();
                for (Map<String, Object> p : products) {
                        String name = (String) p.get("name");
                        if (name == null)
                                continue;
                        // Normalize: lowercase, remove accents for comparison
                        String nameNorm = name.toLowerCase()
                                        .replace("á", "a").replace("é", "e").replace("í", "i")
                                        .replace("ó", "o").replace("ú", "u").trim();
                        String targetClean = targetNorm
                                        .replace("á", "a").replace("é", "e").replace("í", "i")
                                        .replace("ó", "o").replace("ú", "u");
                        if (nameNorm.equals(targetClean)) {
                                Double rentalPrice = null;
                                if (p.containsKey("rentalPricePerDay") && p.get("rentalPricePerDay") != null) {
                                        rentalPrice = Double.valueOf(p.get("rentalPricePerDay").toString());
                                } else if (p.containsKey("price") && p.get("price") != null) {
                                        rentalPrice = Double.valueOf(p.get("price").toString());
                                }
                                if (rentalPrice != null && rentalPrice > 0) {
                                        return (rentalPrice % 1 == 0) ? String.format("%.0f", rentalPrice)
                                                        : rentalPrice.toString();
                                }
                        }
                }
                return "?";
        }

        /**
         * Construye el system prompt con el contexto del negocio
         */
        public String buildSystemPrompt(Map<String, Object> businessContext) {
                StringBuilder prompt = new StringBuilder();

                // ── IDENTITY ──────────────────────────────────────────────
                prompt.append("Eres Lunita, asistente de Media Luna Snack Bar (Manzanillo, Colima). Amigable, casual, mexicano, emojis moderados.\n\n");

                // ── Extract products list for reuse ──
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> productsList = (businessContext != null
                                && businessContext.containsKey("products"))
                                                ? (List<Map<String, Object>>) businessContext.get("products")
                                                : new ArrayList<>();

                // ── PRODUCTS (names only — keep prompt small) ─────────────
                prompt.append("PRODUCTOS (nombres EXACTOS para comandos):\n");
                for (Map<String, Object> p : productsList) {
                        StringBuilder prodLine = new StringBuilder();
                        prodLine.append("- ").append(p.get("name")).append(" [")
                                        .append(p.getOrDefault("category", "")).append("]");

                        // Add description so the AI doesn't invent product contents
                        Object desc = p.getOrDefault("description", p.getOrDefault("desc", null));
                        if (desc != null && !desc.toString().isEmpty()) {
                                prodLine.append(" — ").append(desc);
                        }

                        // Add base price or rental price
                        Double basePrice = null;
                        if (p.containsKey("rentalPricePerDay") && p.get("rentalPricePerDay") != null) {
                                basePrice = Double.valueOf(p.get("rentalPricePerDay").toString());
                        } else if (p.containsKey("price") && p.get("price") != null) {
                                basePrice = Double.valueOf(p.get("price").toString());
                        }

                        if (basePrice != null && basePrice > 0) {
                                String priceStr = (basePrice % 1 == 0) ? String.format("%.0f", basePrice)
                                                : basePrice.toString();
                                prodLine.append(" ($").append(priceStr).append(")");
                        }

                        // Check if this product has bowl quarter tiers (Papas)
                        boolean hasBowlQuarter = p.containsKey("quarterPriceTiers")
                                        && p.get("quarterPriceTiers") != null;
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> qTiersCheck = hasBowlQuarter
                                        ? (List<Map<String, Object>>) p.get("quarterPriceTiers")
                                        : null;
                        hasBowlQuarter = hasBowlQuarter && qTiersCheck != null && !qTiersCheck.isEmpty();

                        if (hasBowlQuarter) {
                                // For Papas: skip inline tiers; will add a separate table below
                                prodLine.append(" (ver TABLA DE PRECIOS PAPAS abajo)");
                        } else {
                                // Normal products: add inline tier info
                                if (p.containsKey("priceTiers") && p.get("priceTiers") != null) {
                                        @SuppressWarnings("unchecked")
                                        List<Map<String, Object>> tiers = (List<Map<String, Object>>) p
                                                        .get("priceTiers");
                                        if (!tiers.isEmpty()) {
                                                prodLine.append(" (Mayoreo: ");
                                                for (int i = 0; i < tiers.size(); i++) {
                                                        Map<String, Object> t = tiers.get(i);
                                                        Double priceD = Double
                                                                        .valueOf(t.get("price").toString());
                                                        String priceStr = (priceD % 1 == 0)
                                                                        ? String.format("%.0f", priceD)
                                                                        : priceD.toString();
                                                        prodLine.append("[De ").append(t.get("minGuests")).append(" a ")
                                                                        .append(t.get("maxGuests"))
                                                                        .append(" personas: $")
                                                                        .append(priceStr).append("]");
                                                        if (i < tiers.size() - 1)
                                                                prodLine.append(" ");
                                                }
                                                prodLine.append(")");
                                        }
                                }
                        }
                        prodLine.append("\n");
                        prompt.append(prodLine);
                }

                // ── SEPARATE PAPAS PRICE TABLE ──
                for (Map<String, Object> p : productsList) {
                        boolean hasBowlQuarter = p.containsKey("quarterPriceTiers")
                                        && p.get("quarterPriceTiers") != null;
                        if (!hasBowlQuarter)
                                continue;
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> halfTiers = p.containsKey("priceTiers")
                                        ? (List<Map<String, Object>>) p.get("priceTiers")
                                        : List.of();
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> quarterTiers = (List<Map<String, Object>>) p
                                        .get("quarterPriceTiers");
                        if (quarterTiers == null || quarterTiers.isEmpty())
                                continue;

                        prompt.append("\nTABLA DE PRECIOS PAPAS (usa EXACTAMENTE estos precios del catálogo):\n");
                        prompt.append("Personas | Bowl 1/4 | Bowl 1/2\n");

                        // Build lookup map for half tiers
                        Map<String, String> halfMap = new HashMap<>();
                        for (Map<String, Object> t : halfTiers) {
                                String range = t.get("minGuests") + "-" + t.get("maxGuests");
                                Double priceD = Double.valueOf(t.get("price").toString());
                                halfMap.put(range, (priceD % 1 == 0) ? String.format("$%.0f", priceD)
                                                : "$" + priceD);
                        }

                        // Output rows from quarter tiers, matching half tiers where ranges align
                        for (Map<String, Object> qt : quarterTiers) {
                                String range = qt.get("minGuests") + "-" + qt.get("maxGuests");
                                Double qPrice = Double.valueOf(qt.get("price").toString());
                                String qStr = (qPrice % 1 == 0) ? String.format("$%.0f", qPrice)
                                                : "$" + qPrice;
                                String hStr = halfMap.getOrDefault(range, "—");
                                // If no exact range match, look for a half tier that contains this range
                                if ("—".equals(hStr)) {
                                        int min = Integer.parseInt(qt.get("minGuests").toString());
                                        for (Map<String, Object> ht : halfTiers) {
                                                int hMin = Integer.parseInt(ht.get("minGuests").toString());
                                                int hMax = Integer.parseInt(ht.get("maxGuests").toString());
                                                if (min >= hMin && min <= hMax) {
                                                        Double hPrice = Double
                                                                        .valueOf(ht.get("price").toString());
                                                        hStr = (hPrice % 1 == 0)
                                                                        ? String.format("$%.0f", hPrice)
                                                                        : "$" + hPrice;
                                                        break;
                                                }
                                        }
                                }
                                prompt.append(range).append(" | ").append(qStr).append(" | ").append(hStr)
                                                .append("\n");
                        }
                }
                prompt.append("\n");

                // ── CURRENT CART ──────────────────────────────────────────
                if (businessContext != null && businessContext.containsKey("cart")) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> cart = (List<Map<String, Object>>) businessContext.get("cart");
                        if (cart != null && !cart.isEmpty()) {
                                prompt.append("CARRITO ACTUAL SECRETO:");
                                for (Map<String, Object> item : cart) {
                                        prompt.append(" ").append(item.get("name")).append(",");
                                }
                                prompt.append("\n🚨 ALERTA CRÍTICA: ¡IGNORA ESTE CARRITO! ES UN SECRETO DEL SISTEMA. TIENES ESTRICTAMENTE PROHIBIDO mencionarle al cliente qué hay en el carrito. JAMÁS digas 'P.D.', ni 'Recuerda que ya tienes', ni 'Ahora tienes en el carrito'. Te borrarán la memoria si lo haces.\n\n");
                        }
                }

                // ── COMMANDS ──────────────────────────────────────────────
                prompt.append("COMANDOS (invisibles al cliente, van al final del mensaje):\n");
                prompt.append("||SET_QTY:N:NombreExacto|| o ||SET_QTY:N:NombreExacto:PrecioTotal|| → Agregar/actualizar producto. N=cantidad total. 'PrecioTotal' (solo números) es OBLIGATORIO si aplicaste precio de mayoreo o cotización.\n");
                prompt.append("||REMOVE:NombreExacto|| → Quitar producto.\n");
                prompt.append("||ORDER_COMPLETE:nombre|telefono|correo|lugar|fecha|hora|| → OBLIGATORIO emitir SOLO cuando el cliente ya te dio TODOS estos datos para finalizar el pedido.\n");
                prompt.append("||PEOPLE:N|| → Cuando mencionen número de personas.\n\n");
                prompt.append("REGLA DE CIERRE DE PEDIDO (¡MUY ESTRICTA!):\n");
                prompt.append("  - Cuando el cliente diga 'sería todo', 'nada más', 'ok', o indique que ya terminó de pedir:\n");
                prompt.append("  - PASO 1: ¡PROHIBIDO DESPEDIRSE O CERRAR EL PEDIDO AÚN!\n");
                prompt.append("  - PASO 2: Debes recolectar OBLIGATORIAMENTE 6 datos en este orden: 1. Nombre, 2. Teléfono, 3. Correo, 4. Lugar del evento, 5. Fecha, 6. Hora.\n");
                prompt.append("  - PASO 3: PREGUNTA SOLO UN DATO A LA VEZ. PROHIBIDO pedir dos o más datos en el mismo mensaje.\n");
                prompt.append("    Ejemplo CORRECTO: '¿Cuál es tu nombre?' → esperas respuesta → '¿Tu número de WhatsApp?' → esperas → etc.\n");
                prompt.append("    Ejemplo INCORRECTO: '¿Me das tu nombre, teléfono y correo?' ← ESTO ESTÁ PROHIBIDO.\n");
                prompt.append("    Empieza siempre preguntando el nombre. Si ya lo tienes, pregunta el siguiente dato faltante.\n");
                prompt.append("  - PASO 4: ¡SOLO CUANDO TENGAS LOS 6 DATOS EXACTOS Y TODOS LOS PRODUCTOS ESTÉN AGREGADOS AL CARRITO! generarás el mensaje final.\n");
                prompt.append("  - PASO 4.1: PROHIBIDO emitir ||ORDER_COMPLETE|| en el MISMO mensaje que un ||SET_QTY||. Son mensajes SEPARADOS. Primero emites SET_QTY, esperas el siguiente turno, y SOLO entonces inicias el cierre y pides datos.\n");
                prompt.append("  - PASO 4.2: REGLA DE INTERRUPCIÓN: Si durante la recolección de los 6 datos (o justo después de ellos), el cliente decide agregar un NUEVO PRODUCTO, ¡ABORTA EL CIERRE! Concéntrate EXCLUSIVAMENTE en manejar el nuevo producto (cotizar, preguntar tamaño/personas, confirmar y agregar al carrito). NUNCA repitas el resumen del pedido, ni vuelvas a pedir el lugar/fecha, ni menciones el enganche hasta que el cliente vuelva a afirmar que 'ya es todo'.\n");
                prompt.append("  - PASO 4.3: PROHIBIDO ABSOLUTO — después de confirmar un producto o recolectar un dato, tu mensaje de TEXTO debe tener UNA SOLA COSA: la confirmación breve y la siguiente pregunta. NADA MÁS.\n");
                prompt.append("    ❌ PROHIBIDO: listar productos del carrito, calcular totales, mencionar otros productos.\n");
                prompt.append("    ✅ CORRECTO: '¡Listo! ¿Gustas agregar algo más o sería todo?' ||SET_QTY:5:tablon:1000||\n");
                prompt.append("    ⚠️ ACLARACIÓN CRÍTICA: Los comandos ||SET_QTY|| son CARGA DEL SISTEMA INVISIBLE. NO cuentan como texto. DEBES EMITIR el ||SET_QTY|| obligatorio AL FINAL de tu mensaje corto de confirmación, incluso si en ese mismo mensaje estás preguntando el Nombre o cualquier otro dato para finalizar.\n");
                prompt.append("    Si tu texto visible tiene más de 2 líneas durante la recolección de datos, LA ESTÁS CAGANDO.\n\n");
                prompt.append("  - PASO 5: Tu mensaje final DEBE decir ÚNICAMENTE: '¡Excelente! He generado el resumen de tu pedido. Por favor revísalo a continuación.'\n");
                prompt.append("  - 🚨 REGLA CRÍTICO OBLIGATORIA (CANDADO): ¡ESTRICTAMENTE PROHIBIDO EMITIR `||ORDER_COMPLETE:nombre|telefono|correo|lugar|fecha|hora||` SI NO HAS PREGUNTADO Y CONFIRMADO TODOS ESOS 6 DATOS (NOMBRE, TELÉFONO, CORREO, LUGAR, FECHA, HORA)! Si el cliente dice 'sería todo', ¡NO CIERRES! Empieza en el PASO 2 con '¿Cuál es tu nombre?'. ESTÁ PROHIBIDO GENERAR DATOS FALSOS O MARCAR EL COMANDO ANTES DE SABER SUS 6 DATOS.\n");
                prompt.append("  - 🚨 REGLA CRÍTICO NO-RESUMEN: ¡ESTRICTAMENTE PROHIBIDO GENERAR UN RESUMEN TEXTUAL DE LOS PRODUCTOS O PRECIOS! NO muestres productos, NO calcules totales, NO menciones el descuento del 15%. El sistema mostrará el resumen visual perfecto automáticamente...\n");
                prompt.append("  - Al mero final del último mensaje de recolección de los 6 datos (ya no tienes nada más que pedir), emite el comando OBLIGATORIO: ||ORDER_COMPLETE:nombre|telefono|correo|lugar|fecha|hora||\n\n");
                prompt.append("REGLA CONTEXTO DE PERSONAS:\n");
                prompt.append("  - MUY IMPORTANTE: Para CADA snack diferente que pida cotizar el cliente, SIEMPRE debes preguntar separadamente: '¿Para cuántas personas es este snack?'\n");
                prompt.append("  - Cada snack se cotiza de manera INDIVIDUAL según su propio número de personas (ej. 50 personas para papas, 30 para tostilocos).\n");
                prompt.append("  - PROHIBIDO asumir que todos los snacks de la conversación son para la misma cantidad de personas. Siempre pregunta.\n\n");

                // ── RENTAS (precios dinámicos desde BD) ──
                String pTablon = findRentalPrice(productsList, "tablon");
                String pTablonSillas = findRentalPrice(productsList, "tablon sillas");
                String pTablonCompleto = findRentalPrice(productsList, "tablon con sillas y mantel");
                String pMesa = findRentalPrice(productsList, "mesa redonda");
                String pMesaSillas = findRentalPrice(productsList, "mesa redonda con sillas");
                String pMesaCompleta = findRentalPrice(productsList, "mesa redonda con sillas y mantel");
                String pBrincolin = findRentalPrice(productsList, "brincolin");
                String pSilla = findRentalPrice(productsList, "silla plegable");

                prompt.append("REGLA RENTAS:\n");
                prompt.append("  - NUNCA preguntes cuántas personas en rentas. Eso es SOLO para snacks.\n");
                prompt.append("  - VARIANTES TABLÓN: PRIMERO pregunta '¿Cuántos tablones necesitas?' → cliente responde → DESPUÉS pregunta '¿Los quieres solos ($")
                                .append(pTablon).append("), con sillas ($").append(pTablonSillas)
                                .append(") o con sillas y mantel ($").append(pTablonCompleto).append(")?'\n");
                prompt.append("  - PROHIBIDO preguntar variante sin saber la cantidad primero.\n");
                prompt.append("  - VARIANTES MESA REDONDA: PRIMERO pregunta '¿Cuántas mesas redondas necesitas?' → cliente responde → DESPUÉS pregunta '¿Las quieres solas ($")
                                .append(pMesa).append("), con sillas ($").append(pMesaSillas)
                                .append(") o con sillas y mantel ($").append(pMesaCompleta).append(")?'\n");
                prompt.append("  - PROHIBIDO preguntar variante sin saber la cantidad primero.\n");
                prompt.append("  - 🚨 REGLA CRÍTICA CERO COMANDOS AL OFRECER OPCIONES: Cuando ofrezcas las 3 opciones (solos, con sillas o con sillas y mantel), ¡TIENES ESTRICTAMENTE PROHIBIDO EMITIR CUALQUIER COMANDO `||SET_QTY||`! Solo debes esperar a que el cliente te responda cuál opción quiere. NO agregues las opciones al carrito. Solo pregunta y quédate esperando.\n");
                prompt.append("  - brincolin=$").append(pBrincolin)
                                .append(" por unidad. silla plegable se renta por unidad ($").append(pSilla)
                                .append(").\n");
                prompt.append("  - IMPORTANTE: Para agregar al carrito, el nombre en ||SET_QTY|| debe ser EXACTAMENTE: 'tablon', 'tablon sillas', 'tablon con sillas y mantel', 'mesa redonda', 'mesa redonda con sillas', 'mesa redonda con sillas y mantel', 'brincolin', o 'silla plegable'.\n");
                prompt.append("  - FLUJO OBLIGATORIO PARA RENTAS (3 PASOS SIN SALTARSE):\n");
                prompt.append("    PASO 1: Cliente elige variante (ej: 'con mantel', 'con sillas', 'solos') → calcula precio total (cantidad × precio) y muéstralo.\n");
                prompt.append("    PASO 2: Pregunta EXACTAMENTE: '¿Lo agrego al carrito?' — REGLA DE ORO: Elegir una variante NO es confirmar el pedido. NO EMITAS ||SET_QTY|| AQUÍ. PROHIBIDO emitir comandos en el PASO 2.\n");
                prompt.append("      ❌ EJEMPLO INCORRECTO: 'Serían $1100. ¿Lo agrego al carrito? ||SET_QTY:5:tablon con sillas y mantel:1100||'\n");
                prompt.append("      ✅ EJEMPLO CORRECTO: 'Serían $1100 en total. ¿Lo agrego al carrito?'\n");
                prompt.append("    PASO 3: Cliente responde confirmando ('sí', 'dale', 'va', 'ok', 'agrega') → AHORA SÍ es OBLIGATORIO emitir ||SET_QTY:N:nombreVariante:precioTotal||.\n");
                prompt.append("      ⚠️ MUY IMPORTANTE EN PASO 3: Incluso si te das cuenta de que el pedido ha terminado y vas a pedir el Nombre del cliente, SIGUES OBLIGADO a emitir el ||SET_QTY|| del producto recién confirmado en ese mismo mensaje.\n");
                prompt.append("      ✅ EJEMPLO CORRECTO PASO 3 (Transición normal): '¡Agregado! ¿Gustas agregar algo más o sería todo?' ||SET_QTY:5:tablon con sillas:1000||\n");
                prompt.append("    ⚠️ JAMÁS combines PASO 2 y PASO 3 en el mismo mensaje.\n");
                prompt.append("  - 🚨 REGLA ANTI-MULTIPLICACIÓN DE MOBILIARIO (¡ESTRICTA!):\n");
                prompt.append("    Si el cliente pide la cantidad Y la variante exacta en un solo mensaje (ej: 'necesito 5 tablones con sillas y mantel'), SALTA LOS PASOS 1 Y 2 de preguntas, asume la variante completa.\n");
                prompt.append("    PASO INMEDIATO: Calcula el MULTIPLO EXACTO para ESA variante SOLAMENTE (5 x Precio `tablon con sillas y mantel`), muéstrale el total y pregúntale '¿Lo agrego al carrito?'.\n");
                prompt.append("    🚫 ¡JAMÁS EMITAS MÁS DE UN COMANDO `||SET_QTY||` PARA EL MISMO MUEBLE! Si pidió 'tablón con sillas y mantel', su comando al confirmar será ÚNICAMENTE `||SET_QTY:5:tablon con sillas y mantel:Total||`.\n");
                prompt.append("    🚫 ¡ESTÁ ESTRICTAMENTE PROHIBIDO separar su pedido en 5 tablones, 5 sillas y 5 manteles! Es UN SOLO paquete llamado `tablon con sillas y mantel`.\n");
                prompt.append("  - ⚠️ REGLA ANTI-CIERRE PREMATURO: Después de emitir un ||SET_QTY|| para una renta, tu ÚNICA pregunta textual debe ser: '¿Gustas agregar algo más o sería todo?'. ¡PROHIBIDO empezar a pedir el Nombre, PROHIBIDO hacer resúmenes del pedido, PROHIBIDO sumar totales de otros productos!\n\n");
                // ── SNACKS Y BEBIDAS ──
                prompt.append("REGLA SNACKS Y BEBIDAS:\n");
                prompt.append("  - PROHIBIDO TOTALMENTE mencionar precios unitarios o hacer cálculos matemáticos. NUNCA digas '$35 por unidad', ni multipliques personas por precio. JAMÁS.\n");
                prompt.append("  - Para los precios, LEE EXACTAMENTE EL NÚMERO DE LA TABLA DE MAYOREO. Si la tabla dice '[De 50 a 59 personas: $2500]', el precio es EXACTAMENTE $2500. Tu no calcules nada.\n");
                prompt.append("  - ⚠️ REGLA ANTI-ERRORES: Lee con extremo cuidado el rango de personas. NUNCA des el precio de un rango mayor (ej. dar precio de 70 personas cuando pidieron 50). Verifica dos veces qué rango de la tabla aplica antes de responder.\n");
                prompt.append("  - El servicio es MÍNIMO 30 personas. Si pide menos: 'El mínimo es 30 personas. ¿Para cuántas sería?'\n");
                prompt.append("  - El servicio incluye 2 horas de atención.\n");
                prompt.append("  - Cuando pide un snack SIN mencionar personas: pregunta SOLO '¿Para cuántas personas es? (mínimo 30)'\n");
                prompt.append("  - Cuando da el número de personas: busca en priceTiers del producto.\n");
                prompt.append("    priceTiers = [{minGuests, maxGuests, price}] donde price es el TOTAL ya calculado. Úsalo directamente.\n");
                prompt.append("  - FLUJO OBLIGATORIO 6 PASOS:\n");
                prompt.append("    (1) Pregunta personas\n");
                prompt.append("    (2) Busca tier correspondiente\n");
                prompt.append("    (3) Muestra SOLO el total: 'Para X personas son $Y total (2 horas de servicio)'\n");
                prompt.append("    (4) Pregunta '¿Lo agrego al carrito?'\n");
                prompt.append("    (5) Espera confirmación: 'sí','ándale','va','agrégalo','dale'\n");
                prompt.append("    (6) Emite ||SET_QTY:1:nombreProducto:precioTotal||\n");
                prompt.append("  - PROHIBIDO saltarse el paso 4. PROHIBIDO emitir ||SET_QTY|| antes de confirmación explícita del cliente.\n");
                prompt.append("  - Si el cliente dice 'no','cancela','déjalo': NO emitas ||SET_QTY||, pregunta si necesita algo más.\n");
                prompt.append("  - Para preguntar confirmación SIEMPRE usa exactamente: '¿Lo agrego al carrito?' NUNCA uses '¿Es correcto?', '¿Así quedamos?' ni variantes.\n");
                prompt.append("  - REGLA DE NO-RESUMEN: Al agregar productos, concéntrate SOLO en confirmar ese producto específico. ESTÁ ESTRICTAMENTE PROHIBIDO mostrar un resumen de toda la orden acumulada, volver a pedir datos de contacto o mencionar descuentos de abonos previos. Guarda el resumen SÓLO para el cierre final.\n\n");

                prompt.append("REGLA PAPAS/BOWL (producto especial):\n");
                prompt.append("  - FLUJO ESTRICTO — NO SALTARSE PASOS:\n");
                prompt.append("    (1) Cliente pide papas → pregunta SOLO: '¿Para cuántas personas? (mínimo 30)'\n");
                prompt.append("    (2) Cliente da número → busca en la TABLA DE PRECIOS PAPAS arriba → muestra AMBOS precios y pregunta el tamaño en UN SOLO mensaje:\n");
                prompt.append("        Ejemplo: 'Para X personas tenemos dos opciones:\n");
                prompt.append("        • Bowl 1/4: $[precio de tabla]\n");
                prompt.append("        • Bowl 1/2: $[precio de tabla]\n");
                prompt.append("        ¿Cuál prefieres?'\n");
                prompt.append("    (3) Cliente elige tamaño → confirma precio del tamaño elegido → pregunta EXACTAMENTE: '¿Lo agrego al carrito?'\n");
                prompt.append("    (4) Espera confirmación\n");
                prompt.append("    (5) Cliente confirma → emite comandos Y NADA MÁS\n");
                prompt.append("  - Bowl 1/2: busca en la columna 'Bowl 1/2' de la TABLA DE PRECIOS PAPAS. Busca la fila donde el rango de personas incluya al número dado.\n");
                prompt.append("  - Bowl 1/4: busca en la columna 'Bowl 1/4' de la TABLA DE PRECIOS PAPAS. Busca la fila donde el rango de personas incluya al número dado.\n");
                prompt.append("  - PROHIBIDO inventar precios. Usa EXACTAMENTE el valor '$' que aparece en la tabla.\n");
                prompt.append("  - Al confirmar el cliente, emite OBLIGATORIAMENTE ambos comandos juntos:\n");
                prompt.append("    ||SET_QTY:1:Papas Preparadas (Bowl):precioTotal|| ||BOWL_SIZE:quarter|| (si eligió 1/4)\n");
                prompt.append("    ||SET_QTY:1:Papas Preparadas (Bowl):precioTotal|| ||BOWL_SIZE:half|| (si eligió 1/2)\n");
                prompt.append("    NOTA: N siempre es 1 para papas. El número de personas va en el precioTotal, no en la cantidad.\n");

                prompt.append("  - CRÍTICO: SOLO EN EL MOMENTO EXACTO en que emitas el ||SET_QTY|| para Bowl (no después, no antes), tu ÚNICA respuesta textual debe ser EXACTAMENTE:\n");
                prompt.append("    '¡Claro! Vamos a armar tus Papas Preparadas (Bowl).'\n");
                prompt.append("  - PROHIBIDO TOTALMENTE después del SET_QTY: mostrar resumen, listar otros productos del carrito,\n");
                prompt.append("    mencionar datos del cliente, calcular totales, mencionar descuentos, preguntar tamaño de nuevo.\n");
                prompt.append("  - El frontend se encarga de la personalización. Tu trabajo termina al emitir el SET_QTY + BOWL_SIZE.\n");
                prompt.append("  - EXCEPCIÓN: Si el bowl es un producto ADICIONAL (el cliente ya tenía otros productos antes), después del SET_QTY agrega EXACTAMENTE: '¿Gustas agregar algo más o sería todo? 🌙'\n\n");
                // ── CHAROLAS DE SNACKS ──
                prompt.append("REGLA CHAROLAS DE SNACKS:\n");
                prompt.append("  - Las Charolas NO TIENEN TAMAÑOS. Si piden una charola, NO PREGUNTES EL TAMAÑO.\n");
                prompt.append("  - Solo pregunta para cuántas personas es y cotiza usando priceTiers.\n");
                prompt.append("  - Cuando el cliente acepte agregar: emite ||SET_QTY:1:Charola de Snacks:precioTotal||\n");
                prompt.append("  - N siempre es 1.\n");
                prompt.append("  - Cuando emitas ||SET_QTY|| para Charola, tu respuesta textual debe ser: '¡Genial! Vamos a personalizar tu Charola de Snacks.'\n");
                prompt.append("  - Si la charola es un producto ADICIONAL (ya había otros en el carrito), agrega al final: '¿Gustas agregar algo más o sería todo? 🌙'\n\n");

                // ── ELOTES ESPECIAL ──
                prompt.append("REGLA ELOTES (Elote en Vaso / Elote Revolcado):\n");
                prompt.append("  - OBLIGATORIO: Cuando el cliente pida 'Elote en Vaso' SIEMPRE ofrécele combinar con 'Elote Revolcado', SIN IMPORTAR QUÉ. (Ej: 'Al ser base elote, puedes combinar con Elote Revolcado por el mismo precio total. ¿Lo combinamos, por ejemplo mitad y mitad?')\n");
                prompt.append("  - OBLIGATORIO: Cuando el cliente pida 'Elote Revolcado' SIEMPRE ofrécele combinar con 'Elote en Vaso' de la misma forma.\n");
                prompt.append("  - PROHIBIDO decir 'u otros' — siempre menciona el producto específico de la combinación.\n");
                prompt.append("  - MUY IMPORTANTE: Si el cliente YA HABÍA AGREGADO un Elote al carrito en un mensaje anterior y ahora pide el otro Elote, TIENES QUE OFRECER LA COMBINACIÓN IGUALMENTE. Cuando el cliente acepte, emitirás un ||SET_QTY|| para AMBOS productos, y el sistema automáticamente ajustará el carrito para reemplazar el Elote anterior por la combinación.\n");
                prompt.append("  - Si el cliente ACEPTA combinar: permite que escoja mitad y mitad, O cualquier otra proporción (ej: 20 de vaso y 30 revolcados).\n");
                prompt.append("  - EXCEPCIÓN MATEMÁTICA CRÍTICA: Si el cliente pide una combinación que NO SUMA el total original (ej: pidió 100 personas, pero dice 'combínalo 20 y 30'), ASUME que el nuevo total es la suma de esas partes (50 personas). NO INTENTES buscar el resto. Pregunta EXACTAMENTE: 'Entonces serían 50 personas en total (20 de uno y 30 del otro) por $X, ¿es correcto?'.\n");
                prompt.append("  - 🚨 REGLA INFALIBLE PARA CÁLCULO DE COMBINACIÓN: Eres malo calculando si no sigues estos pasos exactos. SIEMPRE hazlo así para calcular piezas divididas de Elote:\n");
                prompt.append("    PASO 1: Busca en la tabla el Precio Total para la SUMA TOTAL de personas combinadas (ej. Si piden 70 y 30, el total es 100. En la tabla, 100 personas de elote cuesta $4500).\n");
                prompt.append("    PASO 2: Saca el porcentaje que representa cada parte del total (70 es el 70%, 30 es el 30%).\n");
                prompt.append("    PASO 3: Sácale ese porcentaje al Precio Total. (El 70% de $4500 es $3150. El 30% de $4500 es $1350). Esos son los precios fijos que debes poner en ||SET_QTY||.\n");
                prompt.append("    PROHIBIDO buscar en la tabla el precio de 70 y el precio de 30 por separado. Solo busca el de 100 y divídelo en porcentajes.\n");
                prompt.append("  - Para confirmar la combinación, pregunta EXACTAMENTE: '¿Lo agrego al carrito?' NUNCA uses '¿Te gustaría proceder?' ni variantes.\n");
                prompt.append("  - ⚠️ REGLA CRÍTICA DESPUÉS DE ELOTES: Si el cliente confirma la combinación y en el mismo mensaje dice 'sería todo', ¡NO CIERRES EL PEDIDO TODAVÍA! Emite los ||SET_QTY|| obligatorios y en el texto visible responde: '¡Agregado! Para finalizar, ¿cuál es tu nombre?'. PROHIBIDO emitir ||ORDER_COMPLETE|| sin antes pedir los 6 datos.\n\n");
                // ── GENERALES ──
                prompt.append("REGLAS GENERALES:\n");
                prompt.append("1. Usa nombre EXACTO de productos de la lista (en SINGULAR, JAMÁS EN PLURAL, EJ: NO DIGAS 'tablones', di 'tablon'). Sin cambiar acentos.\n");
                prompt.append("2. Para RENTAS: ten en cuenta la cantidad exacta de unidades que pidió el cliente. NO asumas 1. Para SNACKS: N siempre es 1 independientemente del número de personas.\n");
                prompt.append("3. MUY IMPORTANTE: Si el cliente ESPCÍFICAMENTE confirma agregar un producto ('sí', 'agregalo'), ESTÁS OBLIGADO a emitir ||SET_QTY|| al final. EXCEPCIÓN CRÍTICA: Responder a una pregunta de variante de renta (ej. decir 'con mantel') NO ES CONFIRMAR. En ese momento está ESTRICTAMENTE PROHIBIDO emitir ||SET_QTY||.\n");
                prompt.append("   IMPORTANTE: Para snacks y bebidas, N en SET_QTY SIEMPRE es 1. El número de personas NO va en N, va reflejado en el precioTotal.\n");
                prompt.append("4. Para 'qué me recomiendas': sugiere 2-3 productos populares brevemente.\n");
                prompt.append("5. Para preguntas de ingredientes o contenido: responde EXCLUSIVAMENTE con la descripción del producto que aparece en la lista de arriba. PROHIBIDO ABSOLUTO inventar ingredientes, adiciones o detalles que NO estén en la descripción. Si la descripción no detalla ingredientes, di solo lo que dice la descripción.\n");
                prompt.append("6. PROHIBIDO hacer dos preguntas en el mismo mensaje. EXCEPCIÓN: Si el cliente pide MÚLTIPLES productos diferentes a la vez, SÍ puedes hacer una pregunta por cada producto que requiera aclaración.\n");
                prompt.append("7. Tono amigable y casual de Lunita 🌙. Confirma lo agregado y pregunta '¿Algo más?'\n");
                prompt.append("8. MÚLTIPLES PRODUCTOS A LA VEZ: Si el cliente pide varios productos en un mismo mensaje, PROCESA TODOS ELLOS. Si son pedidos directos, emite múltiples comandos ||SET_QTY|| en tu respuesta. Si alguno requiere aclaración, haz las preguntas necesarias en el mismo mensaje, en lugar de ignorar productos.\n\n");
                prompt.append("9. REGLA ANTI-CONFUSIÓN: Si el cliente pide un producto NUEVO y DIFERENTE al que acabas de agregar (ej: pidió papas y ahora pide tablones), trata ese nuevo producto como un flujo 100% independiente. NO arrastres contexto del producto anterior (no menciones bowl sizes, bases ni toppings de flujos anteriores).\n");
                prompt.append("   EXCEPCIÓN: Si el cliente sigue dentro del flujo de personalización del MISMO producto (ej: eligió Bowl 1/2 y ahora está eligiendo bases de esas papas), SÍ mantén ese contexto activo.\n");
                prompt.append("10. PROHIBIDO ABSOLUTO en CUALQUIER mensaje que no sea el cierre final:\n");
                prompt.append("    - JAMÁS uses: 'P.D.', 'recuerda', 'recordarte', 'no olvides', 'ahora tienes', 'como te mencioné', 'ya tenías', 'anteriormente pediste'\n");
                prompt.append("    - JAMÁS listes productos del carrito ni menciones qué tiene el cliente en su pedido\n");
                prompt.append("    - JAMÁS mezcles instrucciones. Si confirmas un producto, NO empieces a pedir el nombre, ni a armar otros productos, ni a hacer resúmenes.\n");
                prompt.append("    - El carrito es 100% INVISIBLE para ti. SOLO el cierre final puede mencionar productos del carrito.\n");
                prompt.append("    - 🚨 ESTRICTAMENTE PROHIBIDO decir 'Vamos a armar tu pedido' o listar productos como 'Tienes: X, Total: Y' durante la recolección de productos. Eso déjalo para el final.\n");
                prompt.append("    REGLA DE ORO: Un mensaje = Una acción. Si estás confirmando tablones, SOLO confirma tablones. NO menciones papas, no pidas datos de cierre. NADA MÁS. Termina tu frase con '¿Gustas agregar algo más o sería todo?'.\n");
                return prompt.toString();
        }

        /**
         * Envía un mensaje a Groq y obtiene la respuesta
         */
        public String chat(String userMessage, List<ChatMessage> context, Map<String, Object> businessContext) {
                try {
                        // Construir lista de mensajes en formato OpenAI/Groq
                        List<Map<String, String>> messages = new ArrayList<>();

                        // Agregar system prompt
                        String systemPrompt = buildSystemPrompt(businessContext);
                        Map<String, String> systemMessage = new HashMap<>();
                        systemMessage.put("role", "system");
                        systemMessage.put("content", systemPrompt);
                        messages.add(systemMessage);

                        // Agregar contexto previo (últimos 80 mensajes para que la IA recuerde
                        // datos que pasaron hace rato, como el nombre y WhatsApp en chats muy largos)
                        if (context != null && !context.isEmpty()) {
                                int startIndex = Math.max(0, context.size() - 80);
                                for (ChatMessage msg : context.subList(startIndex, context.size())) {
                                        Map<String, String> message = new HashMap<>();
                                        message.put("role", msg.getRole());
                                        message.put("content", msg.getContent());
                                        messages.add(message);
                                }
                        }

                        // Agregar mensaje actual del usuario
                        Map<String, String> userMsg = new HashMap<>();
                        userMsg.put("role", "user");
                        userMsg.put("content", userMessage);
                        messages.add(userMsg);

                        // Crear request body
                        Map<String, Object> requestBody = new HashMap<>();
                        requestBody.put("model", model);
                        requestBody.put("messages", messages);
                        requestBody.put("temperature", 0.7);
                        requestBody.put("max_tokens", 500);

                        // Configurar headers
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        headers.setBearerAuth(apiKey);

                        // Hacer request
                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                        ResponseEntity<Map> response = restTemplate.postForEntity(
                                        apiUrl,
                                        entity,
                                        Map.class);

                        // Extraer texto de la respuesta
                        Map responseBody = response.getBody();
                        if (responseBody != null && responseBody.containsKey("choices")) {
                                @SuppressWarnings("unchecked")
                                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody
                                                .get("choices");
                                if (!choices.isEmpty()) {
                                        @SuppressWarnings("unchecked")
                                        Map<String, Object> message = (Map<String, Object>) choices.get(0)
                                                        .get("message");
                                        String content = (String) message.get("content");
                                        if (content != null && !content.isEmpty()) {
                                                return content.trim();
                                        }
                                }
                        }

                        return "Lo siento, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo? 😅";

                } catch (Exception e) {
                        System.err.println("Error al llamar a Groq API: " + e.getMessage());
                        e.printStackTrace();
                        return "Ups, tuve un problema técnico 🙈 ¿Me repites lo que necesitas?";
                }
        }

        /**
         * Detecta si la respuesta sugiere alguna acción
         */
        public String detectAction(String aiResponse, String userMessage) {
                String lowerResponse = aiResponse.toLowerCase();
                String lowerUser = userMessage.toLowerCase();

                // 0a. Detectar marcador de cierre en la respuesta de la IA (máxima prioridad)
                if (lowerResponse.contains("||order_complete||")) {
                        return "order_complete";
                }

                // 0b. Detectar comando de remoción en la respuesta de la IA
                if (lowerResponse.contains("||remove:")) {
                        return "remove_product";
                }

                // 1. (ask_table_type removed — AI handles tablón/paquete directly via SET_QTY)

                // 2. Detectar si quiere personalizar un bowl o charola
                if ((lowerUser.contains("personalizar") || lowerUser.contains("personalizarlo")
                                || lowerUser.contains("personaliza") ||
                                lowerUser.contains("escoger") || lowerUser.contains("elegir")
                                || lowerUser.contains("armar")) &&
                                (lowerUser.contains("bowl") || lowerUser.contains("papa"))) {
                        return "start_bowl_builder";
                }

                if ((lowerUser.contains("personalizar") || lowerUser.contains("personalizarla") ||
                                lowerUser.contains("armar") || lowerUser.contains("escoger")) &&
                                lowerUser.contains("charola")) {
                        return "start_tray_builder";
                }

                // 3. Detectar si la IA sugiere abrir personalización
                if (lowerResponse.contains("armar tus papas") || lowerResponse.contains("armar tu bowl")) {
                        return "start_bowl_builder";
                }

                if (lowerResponse.contains("personalizar tu charola") || lowerResponse.contains("armar tu charola")) {
                        return "start_tray_builder";
                }

                // 4. Detectar frases de cierre de pedido (va ANTES de show_menu para evitar
                // falsos positivos)
                String[] closingPhrases = {
                                "seria todo", "sería todo", "eso es todo", "ya es todo",
                                "nada mas", "nada más", "estamos bien", "con eso",
                                "ya con eso", "gracias nada mas", "gracias nada más", "ya nada",
                                "creo que es todo", "por el momento es todo", "es todo", "solo eso",
                                "nomás eso", "nomas eso"
                };
                for (String phrase : closingPhrases) {
                        if (lowerUser.contains(phrase)) {
                                return "order_complete";
                        }
                }

                // Detectar pregunta de tamaño de bowl para cotización
                if (lowerResponse.contains("manejamos dos precios") && lowerResponse.contains("tamaño")) {
                        return "ask_bowl_size_quote";
                }

                // 5. Detectar si está preguntando sobre el menú completo
                if (lowerUser.contains("menú") || lowerUser.contains("menu") ||
                                lowerUser.contains("opciones")) {
                        return "show_menu";
                }

                return null;
        }
}