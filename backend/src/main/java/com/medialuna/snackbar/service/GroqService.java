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
            prompt.append(
                    "- Papas Preparadas (Bowl): Bowl personalizable con papas, escoges tamaño/base/complementos/toppings\n");
            prompt.append(
                    "- Duros Preparados: Chicharrón de harina con verdura (producto simple, NO personalizable)\n");
            prompt.append("- Tostilocos: Tostitos con cueritos, jícama, pepino\n");
            prompt.append("- Maruchan Preparada: Sopa instantánea con elote y queso\n");
            prompt.append("- Elote en Vaso: Esquite con mayonesa, queso y chile\n");
            prompt.append("- Crepaletas, Fresas con Crema, Mini Hotcakes, Paletas de Hielo\n");
            prompt.append("- Micheladas y Cantaritos\n");
        }
        prompt.append("\n");

        prompt.append("REGLAS IMPORTANTES:\n");
        prompt.append(
                "1. Si dicen 'papas preparadas' sin especificar, pregunta: ¿quieres Bowl (personalizable) o Duros (simple)?\n");
        prompt.append(
                "2. Si el usuario quiere personalizar un Bowl, di: 'Perfecto, te abriré el menú de personalización' (no preguntes ingredientes tú)\n");
        prompt.append("3. NO inventes productos que no están en la lista\n");
        prompt.append("4. NO des precios específicos, di 'depende de la personalización'\n");
        prompt.append("5. Para finalizar pedido, menciona el botón 'Finalizar mi pedido'\n");
        prompt.append("6. NO uses formato JSON, solo texto natural\n");
        prompt.append("7. Sé breve: máximo 2 oraciones por respuesta\n\n");

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

            // Agregar contexto previo (últimos 5 mensajes)
            if (context != null && !context.isEmpty()) {
                int startIndex = Math.max(0, context.size() - 5);
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
            requestBody.put("max_tokens", 150);

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
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
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

        // Detectar si quiere personalizar un bowl
        if ((lowerUser.contains("personalizar") || lowerUser.contains("personalizarlo")
                || lowerUser.contains("personaliza") ||
                lowerUser.contains("escoger") || lowerUser.contains("elegir") || lowerUser.contains("armar")) &&
                (lowerUser.contains("bowl") || lowerUser.contains("papa"))) {
            return "start_bowl_builder";
        }

        // Detectar si la IA sugiere abrir personalizaci��n
        if (lowerResponse.contains("abriré el menú") || lowerResponse.contains("menú de personalización") ||
                lowerResponse.contains("interfaz de personalización")) {
            return "start_bowl_builder";
        }

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
