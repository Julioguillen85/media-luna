package com.medialuna.snackbar.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ImageGenerationService {

    @Value("${gemini.api.key:DISABLED}")
    private String apiKey;

    private static final String GEMINI_MODEL = "gemini-3.1-flash-image-preview";
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/"
            + GEMINI_MODEL + ":generateContent";

    private final RestTemplate restTemplate;

    public ImageGenerationService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000);
        factory.setReadTimeout(120000);
        this.restTemplate = new RestTemplate(factory);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.equals("DISABLED") && !apiKey.isEmpty();
    }

    /**
     * Generate a marketing banner using Gemini with optional reference images.
     * 
     * @param prompt        The text prompt describing the banner to generate
     * @param imageDataList List of base64-encoded images (product photos) to use as
     *                      reference
     * @return Base64-encoded generated image (PNG)
     */
    @SuppressWarnings("unchecked")
    public String generateImageWithReferences(String prompt, List<String> imageDataList) {
        if (!isConfigured()) {
            throw new RuntimeException("Gemini API no configurada.");
        }

        try {
            // Build parts array: text prompt + optional reference images
            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(Map.of("text", prompt));

            // Add reference images if provided
            if (imageDataList != null) {
                for (String imgData : imageDataList) {
                    // Strip data URL prefix if present (e.g., "data:image/jpeg;base64,")
                    String base64 = imgData;
                    String mimeType = "image/jpeg";
                    if (imgData.startsWith("data:")) {
                        int commaIdx = imgData.indexOf(",");
                        if (commaIdx > 0) {
                            String header = imgData.substring(0, commaIdx);
                            base64 = imgData.substring(commaIdx + 1);
                            if (header.contains("image/png"))
                                mimeType = "image/png";
                            else if (header.contains("image/webp"))
                                mimeType = "image/webp";
                        }
                    }

                    Map<String, Object> inlineData = new LinkedHashMap<>();
                    inlineData.put("mime_type", mimeType);
                    inlineData.put("data", base64);
                    parts.add(Map.of("inline_data", inlineData));
                }
            }

            // Build request body
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("contents", List.of(Map.of("parts", parts)));
            body.put("generationConfig", Map.of(
                    "responseModalities", List.of("TEXT", "IMAGE")));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = GEMINI_URL + "?key=" + apiKey;
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            System.out.println("🖼️ Generando banner con Gemini (" + GEMINI_MODEL + ")...");
            System.out.println("📸 Fotos de referencia: " + (imageDataList != null ? imageDataList.size() : 0));

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null) {
                        List<Map<String, Object>> responseParts = (List<Map<String, Object>>) content.get("parts");
                        if (responseParts != null) {
                            for (Map<String, Object> part : responseParts) {
                                if (part.containsKey("inlineData")) {
                                    Map<String, Object> inline = (Map<String, Object>) part.get("inlineData");
                                    String imageBase64 = (String) inline.get("data");
                                    String responseMime = (String) inline.get("mimeType");
                                    if (imageBase64 != null) {
                                        System.out.println("✅ Banner generado exitosamente con Gemini");
                                        // Return as data URL for frontend display
                                        String mime = responseMime != null ? responseMime : "image/png";
                                        return "data:" + mime + ";base64," + imageBase64;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            throw new RuntimeException("Gemini no generó imagen. Verifica tu prompt e inténtalo de nuevo.");
        } catch (Exception e) {
            System.err.println("❌ Error generando banner Gemini: " + e.getMessage());
            throw new RuntimeException("Error generando banner: " + e.getMessage(), e);
        }
    }

    /**
     * Simple text-to-image (no reference images)
     */
    public String generateImage(String prompt) {
        return generateImageWithReferences(prompt, null);
    }

    /**
     * Build a rich marketing prompt for Gemini banner generation.
     * Gemini can understand reference images, so the prompt focuses on
     * the desired layout, style, and text to include.
     */
    public String buildPromoPrompt(String productName, String style, String generatedText) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Create a professional promotional banner/poster for a Mexican snack bar called 'Media Luna'. ");
        prompt.append(
                "Use the provided product photos as reference — incorporate these REAL products into the banner design. ");
        prompt.append("The banner must look like a real social media advertisement. ");
        prompt.append("Include the brand name 'Media Luna' with a crescent moon symbol. ");

        if (productName != null && !productName.isEmpty()) {
            prompt.append("Featured products: ").append(productName).append(". ");
        }

        // Extract occasion theming
        if (generatedText != null && !generatedText.isEmpty()) {
            String lower = generatedText.toLowerCase();

            if (lower.contains("navid") || lower.contains("christmas")) {
                prompt.append("THEME: Christmas — festive red/green, snowflakes, lights, warm holiday feeling. ");
            } else if (lower.contains("halloween")) {
                prompt.append("THEME: Halloween — orange/purple, pumpkins, bats, spooky but fun. ");
            } else if (lower.contains("valent")) {
                prompt.append("THEME: San Valentin — pink/red hearts, roses, romantic. ");
            } else if (lower.contains("muerto")) {
                prompt.append("THEME: Dia de Muertos — calaveras, marigolds, papel picado, orange/purple. ");
            } else if (lower.contains("promo") || lower.contains("descuento") || lower.contains("2x1")) {
                prompt.append("THEME: Sale/Promo — bold price tags, discount badges, urgency, bright colors. ");
            } else if (lower.contains("año nuevo")) {
                prompt.append("THEME: New Year — fireworks, gold, sparkles, celebration. ");
            }

            String textContext = generatedText.length() > 200
                    ? generatedText.substring(0, 200)
                    : generatedText;
            prompt.append("Promotional context: ").append(textContext).append(". ");
        }

        // Style
        String stylePrompt = switch (style != null ? style.toLowerCase() : "moderno") {
            case "minimalista" -> "Clean minimalist design, pastel colors, elegant typography.";
            case "vibrante" -> "Bold vibrant colors, energetic, neon accents, dynamic layout.";
            case "elegante" -> "Luxurious dark design, gold accents, sophisticated typography.";
            case "casual" -> "Warm cozy aesthetic, natural tones, inviting feel.";
            case "promo" -> "Bold sale design, red/yellow, large price tags, urgency.";
            default -> "Modern trendy social media design, clean layout, professional branding.";
        };

        prompt.append(stylePrompt);
        prompt.append(" Make it appetizing, professional, square format for Instagram/Facebook.");

        return prompt.toString();
    }
}
