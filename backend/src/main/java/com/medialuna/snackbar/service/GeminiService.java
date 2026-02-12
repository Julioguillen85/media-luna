package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${groq.api.key:DISABLED}")
    private String apiKey;

    @Value("${groq.api.url:DISABLED}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Construye el system prompt con el contexto del negocio
     */
    public String buildSystemPrompt(Map<String, Object> businessContext) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Eres Lunita IA, asistente virtual de Media Luna Snack Bar en Manzanillo, Colima, México.\n\n");

        prompt.append("PERSONALIDAD:\n");
        prompt.append("- Amigable, casual, usa lenguaje mexicano informal\n");
        prompt.append("- Emojis moderados (🌙🍉😊)\n");
        prompt.append("- Respuestas cortas y directas\n");
        prompt.append("- Muy entusiasta sobre los productos\n\n");

        prompt.append("NEGOCIO:\n");
        prompt.append("- Especialidad: Snacks preparados (Papas, Tostilocos, Elotes, Duros, etc.)\n");
        prompt.append("- Bebidas: Micheladas y Cantaritos\n");
        prompt.append("- Horario: 2 PM a 8 PM\n");
        prompt.append("- Ubicación: Solo Manzanillo, Colima\n");
        prompt.append("- Servicio: Cotización para eventos (bodas, fiestas, cumpleaños)\n\n");

        prompt.append("PRODUCTOS DISPONIBLES:\n");
        if (businessContext != null && businessContext.containsKey("products")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> products = (List<Map<String, Object>>) businessContext.get("products");
            for (Map<String, Object> product : products) {
                prompt.append(String.format("- %s: %s\n",
                        product.get("name"),
                        product.get("desc")));
            }
        } else {
            prompt.append("- Papas Preparadas (Bowl): Personalizables (tamaño, base, complementos, toppings)\n");
            prompt.append("- Tostilocos: Tostitos con cueritos, jícama, pepino\n");
            prompt.append("- Maruchan Preparada: Sopa instantánea con elote y queso\n");
            prompt.append("- Elote en Vaso: Esquite con mayonesa, queso y chile\n");
            prompt.append("- Duros Preparados: Chicharrón de harina con verdura\n");
            prompt.append("- Crepaletas, Fresas con Crema, Mini Hotcakes, Paletas de Hielo\n");
            prompt.append("- Micheladas y Cantaritos\n");
        }
        prompt.append("\n");

        prompt.append("REGLAS IMPORTANTES:\n");
        prompt.append("1. Si el usuario pregunta por un producto, describe brevemente y pregunta si lo quiere\n");
        prompt.append("2. Para 'Papas Preparadas (Bowl)', menciona que se personalizan completamente\n");
        prompt.append("3. NO inventes productos que no están en la lista\n");
        prompt.append("4. NO des precios específicos, di 'depende de la personalización'\n");
        prompt.append("5. Si el usuario quiere finalizar pedido, dile que puede usar el botón 'Finalizar mi pedido'\n");
        prompt.append("6. NO uses formato JSON en tus respuestas, solo texto natural\n");
        prompt.append("7. Sé breve: máximo 2-3 oraciones por respuesta\n\n");

        prompt.append("ACCIONES QUE EL USUARIO PUEDE HACER:\n");
        prompt.append("- Agregar productos al carrito (tú solo recomiendas, el sistema lo agrega)\n");
        prompt.append("- Ver el menú completo\n");
        prompt.append("- Personalizar bowls (se hace en la interfaz)\n");
        prompt.append("- Finalizar pedido con el botón cuando esté listo\n\n");

        prompt.append(
                "Responde siempre en español mexicano casual. ¡Sé amigable y ayuda al cliente a descubrir qué se le antoja!");

        return prompt.toString();
    }

    /**
     * Envía un mensaje a Gemini y obtiene la respuesta
     */
    public String chat(String userMessage, List<ChatMessage> context, Map<String, Object> businessContext) {
        try {
            // Construir lista de mensajes
            List<ChatMessage> messages = new ArrayList<>();

            // Agregar system prompt como primer mensaje de usuario
            String systemPrompt = buildSystemPrompt(businessContext);
            messages.add(new ChatMessage("user", systemPrompt + "\n\nUsuario: Hola"));
            messages.add(new ChatMessage("assistant",
                    "¡Hola! 🌙 Soy Lunita, tu asistente para antojos. ¿Qué se te antoja hoy?"));

            // Agregar contexto previo (últimos 5 mensajes para no exceder límites)
            if (context != null && !context.isEmpty()) {
                int startIndex = Math.max(0, context.size() - 5);
                messages.addAll(context.subList(startIndex, context.size()));
            }

            // Agregar mensaje actual del usuario
            messages.add(new ChatMessage("user", userMessage));

            // Crear request para Gemini
            GeminiRequest geminiRequest = GeminiRequest.create(messages);

            // Configurar headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construir URL con API key
            String url = apiUrl + "?key=" + apiKey;

            // Hacer request
            HttpEntity<GeminiRequest> entity = new HttpEntity<>(geminiRequest, headers);
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(
                    url,
                    entity,
                    GeminiResponse.class);

            // Extraer texto de la respuesta
            GeminiResponse responseBody = response.getBody();
            if (responseBody != null) {
                String responseText = responseBody.getTextContent();
                if (responseText != null && !responseText.isEmpty()) {
                    return responseText;
                }
            }

            return "Lo siento, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo? 😅";

        } catch (Exception e) {
            System.err.println("Error al llamar a Gemini API: " + e.getMessage());
            e.printStackTrace();
            return "Ups, tuve un problema técnico 🙈 ¿Me repites lo que necesitas?";
        }
    }

    /**
     * Detecta si la respuesta de Gemini sugiere alguna acción
     * (Versión simple - puede mejorarse con más lógica)
     */
    public String detectAction(String geminiResponse, String userMessage) {
        String lowerResponse = geminiResponse.toLowerCase();
        String lowerUser = userMessage.toLowerCase();

        // Detectar si está preguntando sobre el menú completo
        if (lowerUser.contains("menú") || lowerUser.contains("menu") ||
                lowerUser.contains("todo") || lowerUser.contains("opciones")) {
            return "show_menu";
        }

        // Detectar menciones de productos para agregar
        if (lowerResponse.contains("agregar") || lowerResponse.contains("añ") ||
                lowerUser.contains("quiero") || lowerUser.contains("dame")) {
            return "suggest_product";
        }

        return null;
    }
}
