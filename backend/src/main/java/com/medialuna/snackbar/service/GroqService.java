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
         * Construye el system prompt con el contexto del negocio
         */
        public String buildSystemPrompt(Map<String, Object> businessContext) {
                StringBuilder prompt = new StringBuilder();

                // ── IDENTITY ──────────────────────────────────────────────
                prompt.append("Eres Lunita, asistente de Media Luna Snack Bar (Manzanillo, Colima). Amigable, casual, mexicano, emojis moderados.\n\n");

                // ── PRODUCTS (names only — keep prompt small) ─────────────
                prompt.append("PRODUCTOS (nombres EXACTOS para comandos):\n");
                if (businessContext != null && businessContext.containsKey("products")) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> products = (List<Map<String, Object>>) businessContext
                                        .get("products");
                        for (Map<String, Object> p : products) {
                                StringBuilder prodLine = new StringBuilder();
                                prodLine.append("- ").append(p.get("name")).append(" [")
                                                .append(p.getOrDefault("category", "")).append("]");

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

                                // Add full tier info if available (compressed format)
                                if (p.containsKey("priceTiers") && p.get("priceTiers") != null) {
                                        @SuppressWarnings("unchecked")
                                        List<Map<String, Object>> tiers = (List<Map<String, Object>>) p
                                                        .get("priceTiers");
                                        if (!tiers.isEmpty()) {
                                                prodLine.append(" (Mayoreo: ");
                                                for (int i = 0; i < tiers.size(); i++) {
                                                        Map<String, Object> t = tiers.get(i);
                                                        // Format integer values to drop decimal ".0" if present in
                                                        // price
                                                        Double priceD = Double.valueOf(t.get("price").toString());
                                                        String priceStr = (priceD % 1 == 0)
                                                                        ? String.format("%.0f", priceD)
                                                                        : priceD.toString();
                                                        prodLine.append(t.get("minGuests")).append("p:$")
                                                                        .append(priceStr);
                                                        if (i < tiers.size() - 1)
                                                                prodLine.append(", ");
                                                }
                                                prodLine.append(")");
                                        }
                                }
                                prodLine.append("\n");
                                prompt.append(prodLine);
                        }
                }
                prompt.append("\n");

                // ── CURRENT CART ──────────────────────────────────────────
                if (businessContext != null && businessContext.containsKey("cart")) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> cart = (List<Map<String, Object>>) businessContext.get("cart");
                        if (cart != null && !cart.isEmpty()) {
                                prompt.append("CARRITO ACTUAL:");
                                for (Map<String, Object> item : cart) {
                                        prompt.append(" ").append(item.get("name")).append("×")
                                                        .append(item.get("quantity")).append(",");
                                }
                                prompt.append("\n\n");
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
                prompt.append("  - PASO 4.1: PROHIBIDO emitir ||ORDER_COMPLETE|| en el MISMO mensaje que un ||SET_QTY||. Son mensajes SEPARADOS. Primero emites SET_QTY, esperas el siguiente turno, y SOLO entonces cierras con ORDER_COMPLETE.\n");
                prompt.append("  - PASO 4.2: REGLA DE INTERRUPCIÓN: Si durante la recolección de los 6 datos (o justo después de ellos), el cliente decide agregar un NUEVO PRODUCTO, ¡ABORTA EL CIERRE! Concéntrate EXCLUSIVAMENTE en manejar el nuevo producto (cotizar, preguntar tamaño/personas, confirmar y agregar al carrito). NUNCA repitas el resumen del pedido, ni vuelvas a pedir el lugar/fecha, ni menciones el enganche hasta que el cliente vuelva a afirmar que 'ya es todo'.\n");
                prompt.append("  - PASO 4.3: PROHIBIDO agregar comentarios recordatorios entre paréntesis como '(Récordalo, ya tenías...)' durante el flujo activo. JAMÁS menciones productos anteriores al confirmar uno nuevo.\n\n");
                prompt.append("  - PASO 5: Tu mensaje final DEBE incluir OBLIGATORIAMENTE un RESUMEN DE COMPRA detallado ESCRITO EN EL CHAT.\n");
                prompt.append("  - En este resumen muestra: a) Los productos. b) El TOTAL NORMAL. c) Una nota diciendo '✨ Si apartas tu fecha HOY, tienes un 15% de descuento'. d) El TOTAL CON DESCUENTO APLICADO.\n");
                prompt.append("  - DESCUENTO 15%: Aplica ÚNICAMENTE a snacks y bebidas (Crepaletas, Tostilocos, Elote en Vaso, Tostielote, Papas Preparadas, Charola de Snacks, etc).\n");
                prompt.append("  - PROHIBIDO decir que un snack o bebida no tiene descuento. TODOS los snacks SÍ tienen descuento.\n");
                prompt.append("  - NUNCA apliques el descuento a rentas (tablón, mesa redonda, brincolin, silla plegable).\n");
                prompt.append("  - Al mero final de este mensaje resumen, emite el comando OBLIGATORIO: ||ORDER_COMPLETE:nombre|telefono|correo|lugar|fecha|hora||\n\n");
                prompt.append("REGLA CONTEXTO DE PERSONAS:\n");
                prompt.append("  - MUY IMPORTANTE: Para CADA snack diferente que pida cotizar el cliente, SIEMPRE debes preguntar separadamente: '¿Para cuántas personas es este snack?'\n");
                prompt.append("  - Cada snack se cotiza de manera INDIVIDUAL según su propio número de personas (ej. 50 personas para papas, 30 para tostilocos).\n");
                prompt.append("  - PROHIBIDO asumir que todos los snacks de la conversación son para la misma cantidad de personas. Siempre pregunta.\n\n");
                // ── RENTAS ──
                prompt.append("REGLA RENTAS:\n");
                prompt.append("  - NUNCA preguntes cuántas personas en rentas. Eso es SOLO para snacks.\n");
                prompt.append("  - VARIANTES TABLÓN: PRIMERO pregunta '¿Cuántos tablones necesitas?' → cliente responde → DESPUÉS pregunta '¿Los quieres solos ($100), con sillas ($200) o con sillas y mantel ($220)?'\n");
                prompt.append("  - PROHIBIDO preguntar variante sin saber la cantidad primero.\n");
                prompt.append("  - VARIANTES MESA REDONDA: PRIMERO pregunta '¿Cuántas mesas redondas necesitas?' → cliente responde → DESPUÉS pregunta '¿Las quieres solas ($150), con sillas ($230) o con sillas y mantel ($250)?'\n");
                prompt.append("  - PROHIBIDO preguntar variante sin saber la cantidad primero.\n");
                prompt.append("  - brincolin=$850 por unidad. silla_plegable se renta por unidad ($20).\n");
                prompt.append("  - IMPORTANTE: Para agregar al carrito, el nombre en ||SET_QTY|| debe ser EXACTAMENTE: 'tablon', 'tablon sillas', 'tablon con sillas y mantel', 'mesa redonda', 'mesa redonda con sillas', 'mesa redonda con sillas y mantel', 'brincolin', o 'silla plegable'.\n");
                prompt.append("  - Cuando ya eligió variante:\n");
                prompt.append("      COTIZACIÓN ('cotízame', 'cuánto cuesta', 'presupuesto'): Da precio total → pregunta EXACTAMENTE '¿Lo agrego al carrito?' (sin variantes) → espera confirmación → emite ||SET_QTY||.\n");
                prompt.append("      PEDIDO DIRECTO ('agrégame', 'quiero', 'dame', 'ponme', 'añade'): Emite ||SET_QTY|| inmediatamente. PROHIBIDO preguntar '¿Lo agrego?'\n");
                prompt.append("  - Si el cliente pide cotización SIN especificar variante, PRIMERO pregunta la variante, DESPUÉS cotiza. NUNCA cotices todas las variantes a la vez.\n");
                prompt.append("  - Para rentas, N en ||SET_QTY|| es la cantidad exacta de unidades. Ej: 5 tablones → ||SET_QTY:5:tablon sillas:1000||\n");
                prompt.append("  - Si el pedido es SOLO rentas: NO preguntes personas. Pregunta directamente nombre, WhatsApp, dirección y fecha/hora.\n\n");

                // ── SNACKS Y BEBIDAS ──
                prompt.append("REGLA SNACKS Y BEBIDAS:\n");
                prompt.append("  - PROHIBIDO TOTALMENTE mencionar precios unitarios. NUNCA digas '$35 por unidad', '$90 cada uno', 'cuesta $X por pieza'. JAMÁS.\n");
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
                prompt.append("    (2) Cliente da número → muestra AMBOS precios y pregunta el tamaño en UN SOLO mensaje:\n");
                prompt.append("        Ejemplo para 50p: 'Para 50 personas tenemos dos opciones:\n");
                prompt.append("        • Bowl 1/4: $3,250\n");
                prompt.append("        • Bowl 1/2: $4,800\n");
                prompt.append("        ¿Cuál prefieres?'\n");
                prompt.append("    (3) Cliente elige tamaño → confirma precio del tamaño elegido → pregunta EXACTAMENTE: '¿Lo agrego al carrito?'\n");
                prompt.append("    (4) Espera confirmación\n");
                prompt.append("    (5) Cliente confirma → emite comandos Y NADA MÁS\n");
                prompt.append("  - Bowl 1/2: usa priceTiers del producto.\n");
                prompt.append("  - Bowl 1/4 precios fijos: 30p:$1950, 40p:$2600, 50p:$3250, 60p:$3600, 70p:$4200, 80p:$4800, 90p:$5400, 100p:$5500, 150p:$8250, 200p:$11000.\n");
                prompt.append("  - Al confirmar el cliente, emite OBLIGATORIAMENTE ambos comandos juntos:\n");
                prompt.append("    ||SET_QTY:1:Papas Preparadas (Bowl):precioTotal|| ||BOWL_SIZE:quarter|| (si eligió 1/4)\n");
                prompt.append("    ||SET_QTY:1:Papas Preparadas (Bowl):precioTotal|| ||BOWL_SIZE:half|| (si eligió 1/2)\n");
                prompt.append("    NOTA: N siempre es 1 para papas. El número de personas va en el precioTotal, no en la cantidad.\n");

                prompt.append("  - CRÍTICO: Cuando emitas ||SET_QTY|| para Bowl, tu ÚNICA respuesta textual debe ser EXACTAMENTE:\n");
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
                prompt.append("  - N siempre es 1. Ejemplo: ||SET_QTY:1:Charola de Snacks:3200||\n");
                prompt.append("  - Cuando emitas ||SET_QTY|| para Charola, tu respuesta textual debe ser: '¡Genial! Vamos a personalizar tu Charola de Snacks.'\n");
                prompt.append("  - Si la charola es un producto ADICIONAL (ya había otros en el carrito), agrega al final: '¿Gustas agregar algo más o sería todo? 🌙'\n\n");

                // ── ELOTES ESPECIAL ──
                prompt.append("REGLA ELOTES (Elote en Vaso / Tostielote):\n");
                prompt.append("  - Cuando el cliente pida 'Elote en Vaso': ofrece combinar con 'Tostielote'. Ejemplo: 'Al ser base elote, puedes combinar con Tostielote (mitad y mitad por el mismo precio total). ¿Lo combinamos?'\n");
                prompt.append("  - Cuando el cliente pida 'Tostielote': ofrece combinar con 'Elote en Vaso'. Ejemplo: 'Al ser base elote, puedes combinar con Elote en Vaso (mitad y mitad por el mismo precio total). ¿Lo combinamos?'\n");
                prompt.append("  - PROHIBIDO decir 'u otros' — siempre menciona el producto específico de la combinación.\n");
                prompt.append("  - Si el cliente acepta combinar: divide la cantidad exactamente a la mitad y el precio total también.\n");
                prompt.append("  - Si el cliente NO quiere combinar: agrega solo el producto pedido normalmente con ||SET_QTY:1:NombreProducto:precioTotal||\n");
                prompt.append("  - CÁLCULO ESTRICTO DE MITAD Y MITAD: toma el PRICE TIER del producto pedido y DIVÍDELO exactamente a la mitad. JAMÁS sumes tiers completos de ambos productos.\n");
                prompt.append("    Ej. correcto para 50p: ||SET_QTY:25:Elote en Vaso:1375|| y ||SET_QTY:25:Tostielote:1375||\n");
                prompt.append("  - Para confirmar la combinación, pregunta EXACTAMENTE: '¿Lo agrego al carrito?' NUNCA uses '¿Te gustaría proceder?' ni variantes.\n\n");
                // ── GENERALES ──
                prompt.append("REGLAS GENERALES:\n");
                prompt.append("1. Usa nombre EXACTO de productos de la lista (en SINGULAR, JAMÁS EN PLURAL, EJ: NO DIGAS 'tablones', di 'tablon'). Sin cambiar acentos.\n");
                prompt.append("2. Para RENTAS: recuerda la cantidad exacta de unidades que pidió el cliente. NO asumas 1. Para SNACKS: N siempre es 1 independientemente del número de personas.\n");
                prompt.append("3. MUY IMPORTANTE: Si el cliente confirma agregar un producto, ESTÁS OBLIGADO a emitir ||SET_QTY|| al final. Sin comando = venta ignorada. PERO tu texto debe ser MÍNIMO: solo confirma ESE producto y pregunta '¿Algo más?' NADA de resúmenes, totales ni otros productos. Ejemplo correcto: '¡Listo! Crepaletas para 100 personas agregadas. ¿Algo más? 🌙 ||SET_QTY:1:Crepaletas:5500||'\n");
                prompt.append("   IMPORTANTE: Para snacks y bebidas, N en SET_QTY SIEMPRE es 1. El número de personas NO va en N, va reflejado en el precioTotal.\n");
                prompt.append("4. Para 'qué me recomiendas': sugiere 2-3 productos populares brevemente.\n");
                prompt.append("5. Para preguntas de ingredientes: responde con descripción del producto.\n");
                prompt.append("6. PROHIBIDO hacer dos preguntas en el mismo mensaje. EXCEPCIÓN: Si el cliente pide MÚLTIPLES productos diferentes a la vez, SÍ puedes hacer una pregunta por cada producto que requiera aclaración.\n");
                prompt.append("7. Tono amigable y casual de Lunita 🌙. Confirma lo agregado y pregunta '¿Algo más?'\n");
                prompt.append("8. MÚLTIPLES PRODUCTOS A LA VEZ: Si el cliente pide varios productos en un mismo mensaje, PROCESA TODOS ELLOS. Si son pedidos directos, emite múltiples comandos ||SET_QTY|| en tu respuesta. Si alguno requiere aclaración, haz las preguntas necesarias en el mismo mensaje, en lugar de ignorar productos.\n\n");
                prompt.append("9. REGLA ANTI-CONFUSIÓN: Si el cliente pide un producto NUEVO y DIFERENTE al que acabas de agregar (ej: pidió papas y ahora pide tablones), trata ese nuevo producto como un flujo 100% independiente. NO arrastres contexto del producto anterior (no menciones bowl sizes, bases ni toppings de flujos anteriores).\n");
                prompt.append("   EXCEPCIÓN: Si el cliente sigue dentro del flujo de personalización del MISMO producto (ej: eligió Bowl 1/2 y ahora está eligiendo bases de esas papas), SÍ recuerda y mantén ese contexto activo.\n");
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

                        // Agregar contexto previo (últimos 30 mensajes)
                        if (context != null && !context.isEmpty()) {
                                int startIndex = Math.max(0, context.size() - 30);
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
