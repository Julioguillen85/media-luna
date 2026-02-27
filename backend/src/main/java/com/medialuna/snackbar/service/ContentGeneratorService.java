package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.Product;
import com.medialuna.snackbar.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContentGeneratorService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    @Autowired
    private ProductRepository productRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generate a promotional post for social media
     */
    public String generatePromoPost(String tone, String occasion, List<String> productNames, String platform) {
        List<Product> allProducts = productRepository.findAll();

        // Filter to selected products or use all if none specified
        List<Product> selectedProducts;
        if (productNames != null && !productNames.isEmpty()) {
            selectedProducts = allProducts.stream()
                    .filter(p -> productNames.contains(p.getName()))
                    .collect(Collectors.toList());
        } else {
            selectedProducts = allProducts;
        }

        String productList = selectedProducts.stream()
                .map(p -> "- " + p.getName() + " ($" + p.getPrice() + ")")
                .collect(Collectors.joining("\n"));

        String platformInstructions = getPlatformInstructions(platform);

        String prompt = String.format("""
                Eres Lunita 🌙, la asistente de marketing de Media Luna Snack Bar.
                Genera un post promocional para redes sociales.

                PRODUCTOS DISPONIBLES:
                %s

                TONO: %s
                OCASIÓN/CONTEXTO: %s
                PLATAFORMA: %s

                %s

                REGLAS:
                - Usa emojis relevantes 🌙✨🍿
                - Menciona la marca "Media Luna" o "🌙 Media Luna"
                - Incluye precios si aplica
                - Sé creativo y atractivo
                - NO uses hashtags genéricos como #food, usa específicos como #MediaLuna #SnacksDulzura
                - El texto debe estar listo para copiar y publicar
                - Máximo 280 caracteres para Twitter, 2200 para Instagram/Facebook
                - Si es para grupo de Facebook, haz que suene natural, no como publicidad

                Genera SOLO el texto del post, sin explicaciones adicionales.
                """, productList, tone, occasion, platform, platformInstructions);

        return callGroqAI(prompt);
    }

    /**
     * Generate a group-friendly draft (less promotional, more natural)
     */
    public String generateGroupDraft(List<String> productNames) {
        List<Product> allProducts = productRepository.findAll();
        String productList = allProducts.stream()
                .filter(p -> productNames == null || productNames.isEmpty() || productNames.contains(p.getName()))
                .map(p -> "- " + p.getName() + " ($" + p.getPrice() + ")")
                .collect(Collectors.joining("\n"));

        String prompt = String.format("""
                Eres Lunita 🌙, la asistente de Media Luna Snack Bar.
                Genera un mensaje para GRUPOS DE FACEBOOK que suene natural y amigable,
                NO como publicidad directa.

                PRODUCTOS:
                %s

                REGLAS:
                - Hazlo como si alguien recomendara un lugar a sus amigos
                - Incluye emojis pero no exageres
                - Menciona el nombre del negocio naturalmente
                - Puede ser una historia corta, una experiencia, una recomendación
                - NO uses lenguaje de marketing corporativo
                - Máximo 500 caracteres
                - Incluye un call to action sutil (ej: "si quieren probar...")

                Genera SOLO el texto, sin explicaciones.
                """, productList);

        return callGroqAI(prompt);
    }

    /**
     * Suggest a weekly content schedule
     */
    public String suggestWeeklySchedule() {
        List<Product> products = productRepository.findAll();
        String productList = products.stream()
                .map(p -> p.getName() + " (" + p.getCategory() + ")")
                .collect(Collectors.joining(", "));

        String prompt = String.format("""
                Eres Lunita 🌙, planificadora de contenido de Media Luna Snack Bar.

                PRODUCTOS DISPONIBLES: %s

                Genera un plan de contenido para 7 días (lunes a domingo) con:
                - DÍA: Tipo de post + plataforma + tema/ángulo sugerido
                - Variedad de plataformas (Facebook Page, Instagram Story, Instagram Reel)
                - Mezcla de contenido: promos, historias, detrás de cámaras, testimonios

                Formato de respuesta JSON:
                [
                  {"day": "Lunes", "platform": "FACEBOOK_PAGE", "type": "POST", "theme": "descripción breve"},
                  ...
                ]

                Responde SOLO con el JSON, sin explicaciones.
                """, productList);

        return callGroqAI(prompt);
    }

    /**
     * Generate a unique poster design configuration with AI
     */
    public String generatePosterDesign(String tone, String occasion, List<String> productNames, int productCount) {
        String prompt = String.format(
                """
                        Eres un diseñador gráfico experto. Genera una configuración de diseño JSON para un póster promocional de "Media Luna Snack Bar".

                        CONTEXTO:
                        - Tono: %s
                        - Ocasión: %s
                        - Número de productos: %d

                        Genera un JSON con EXACTAMENTE esta estructura (sin explicaciones, SOLO el JSON):
                        {
                          "layout": "(uno de: packages, grid, hero, split, carousel, magazine, diagonal, mosaic, banner, minimal)",
                          "palette": {
                            "bgFrom": "#hex",
                            "bgTo": "#hex",
                            "accent": "#hex",
                            "text": "#hex",
                            "price": "#hex",
                            "cardBg": "rgba(r,g,b,a)"
                          },
                          "title": "Título creativo para el póster (máx 6 palabras)",
                          "subtitle": "Subtítulo corto opcional",
                          "posterText": "Frase promocional creativa y corta (máx 100 chars)",
                          "decorations": ["(1-3 de: circles, dots, stars, waves, lines, sparkles, confetti, geometric, floral, gradient-orbs)"],
                          "typography": "(uno de: elegant, modern, bold, playful, luxury, minimal, retro)",
                          "cardStyle": "(uno de: rounded, sharp, pill, glass, floating, outlined)",
                          "imageStyle": "(uno de: circle, rounded, square, diamond, blob)",
                          "headerStyle": "(uno de: centered, left-aligned, overlay, split-header, minimal)"
                        }

                        REGLAS DE DISEÑO:
                        - Los colores deben ser armoniosos y profesionales
                        - Para tonos oscuros, usa fondos oscuros con acentos brillantes
                        - Para tonos claros, usa pasteles con acentos vibrantes
                        - El título debe ser creativo y relacionado con la ocasión "%s"
                        - La frase promocional debe ser persuasiva y corta
                        - Varía los layouts: NO siempre uses "grid" o "packages"
                        - Sé MUY creativo con las combinaciones de colores
                        - El cardBg debe tener transparencia (alpha 0.06-0.7)

                        Responde SOLO con el JSON válido, sin markdown ni explicaciones.
                        """,
                tone, occasion, productCount, occasion);

        return callGroqAI(prompt);
    }

    private String getPlatformInstructions(String platform) {
        return switch (platform != null ? platform.toUpperCase() : "") {
            case "FACEBOOK_PAGE" -> "Post para la Página de Facebook. Puede ser más largo y detallado.";
            case "FACEBOOK_STORY" -> "Story para Facebook. Texto corto y directo, máximo 2 líneas.";
            case "INSTAGRAM_STORY" -> "Story para Instagram. Texto muy corto para overlay en imagen.";
            case "INSTAGRAM_REEL" -> "Caption para un Reel de Instagram. Máximo 3 líneas con hashtags.";
            case "GROUP" -> "Mensaje para grupo de Facebook. Natural, no publicitario.";
            default -> "Post general para redes sociales.";
        };
    }

    /**
     * Call Groq AI to generate content (reuses same API as chatbot)
     */
    private String callGroqAI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", List.of(message));
            body.put("temperature", 0.8); // More creative for marketing
            body.put("max_tokens", 1024);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

            if (response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> msgResponse = (Map<String, Object>) choices.get(0).get("message");
                    return (String) msgResponse.get("content");
                }
            }
            return "No se pudo generar el contenido. Intenta de nuevo.";
        } catch (Exception e) {
            System.err.println("Error generando contenido con IA: " + e.getMessage());
            return "Error al generar contenido: " + e.getMessage();
        }
    }
}
