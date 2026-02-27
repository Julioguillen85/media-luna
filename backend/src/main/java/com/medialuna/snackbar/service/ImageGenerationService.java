package com.medialuna.snackbar.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ImageGenerationService {

    @Value("${fal.api.key:DISABLED}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public ImageGenerationService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000);
        factory.setReadTimeout(60000);
        this.restTemplate = new RestTemplate(factory);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.equals("DISABLED");
    }

    /**
     * Generate a marketing image using Fal.ai FLUX Pro API
     */
    @SuppressWarnings("unchecked")
    public String generateImage(String prompt) {
        if (!isConfigured()) {
            throw new RuntimeException("Fal.ai API no configurada.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Key " + apiKey);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("prompt", prompt);

            // Standard Fal.ai / FLUX params format for high quality images
            body.put("image_size", "square_hd");
            body.put("num_images", 1);
            body.put("enable_safety_checker", true);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            System.out.println("🖼️ Generando imagen con Fal.ai FLUX Pro...");

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://fal.run/fal-ai/flux-pro/v1.1", entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> images = (List<Map<String, Object>>) response.getBody().get("images");
                if (images != null && !images.isEmpty()) {
                    String imageUrl = (String) images.get(0).get("url");
                    if (imageUrl != null) {
                        System.out.println("✅ Imagen generada exitosamente con Fal.ai");
                        return imageUrl;
                    }
                }
            }
            throw new RuntimeException("Respuesta inesperada de Fal.ai");
        } catch (Exception e) {
            System.err.println("❌ Error generando imagen Fal.ai: " + e.getMessage());
            throw new RuntimeException("Error generando imagen: " + e.getMessage(), e);
        }
    }

    /**
     * Build a rich marketing prompt using:
     * - Product name
     * - Visual style
     * - AI-generated marketing text (for context)
     */
    public String buildPromoPrompt(String productName, String style, String generatedText) {
        StringBuilder prompt = new StringBuilder();

        // Base prompt focusing heavily on realistic food photography
        prompt.append("Hyper-realistic, high-end commercial food photography. ");
        prompt.append(
                "Mouth-watering presentation, focus on appetizing textures, glistening details, and perfect lighting. ");
        prompt.append("Shot with a macro lens, 85mm, shallow depth of field, stunning bokeh, cinematic food styling. ");

        // Add product context
        if (productName != null && !productName.isEmpty()) {
            prompt.append("The main subject is a delicious Mexican snack: ").append(productName).append(". ");
        }

        // Use AI-generated text to add marketing context (for vibes only, not text)
        if (generatedText != null && !generatedText.isEmpty()) {
            String textContext = generatedText.length() > 150
                    ? generatedText.substring(0, 150)
                    : generatedText;
            prompt.append("The overall mood and atmosphere should reflect this vibe: ").append(textContext)
                    .append(". ");
        }

        // Add visual style with specific lighting/composition instructions
        String stylePrompt = switch (style != null ? style.toLowerCase() : "moderno") {
            case "minimalista" ->
                "Minimalist composition, clean solid color background (like soft pastel or pure white), soft diffused studio lighting, sharp focus on the food, negative space, elegant and premium editorial look.";
            case "vibrante" ->
                "Vibrant pop-art aesthetic, contrasting bright neon background colors, hard directional flash lighting creating sharp shadows, energetic and bold composition, highly saturated colors.";
            case "elegante" ->
                "Luxurious dark moody food photography, dark textured wood or slate background, dramatic chiaroscuro lighting (single directional light), golden hour accents, high-end restaurant presentation.";
            case "casual" ->
                "Cozy and warm rustic table setting, natural window lighting, subtle hints of fresh ingredients scattered around, inviting and wholesome atmosphere, lifestyle food photography.";
            case "promo" ->
                "Eye-catching commercial advertising style, floating ingredients frozen in mid-air, splash effects, ultra-dynamic composition, vivid colors, bright and punchy lighting, cinematic masterpiece.";
            default ->
                "Modern trendy commercial food art, perfectly lit studio environment, highly appetizing and mouth-watering presentation, photorealistic, 8k resolution.";
        };

        prompt.append(stylePrompt);
        prompt.append(
                " CRITICAL INSTRUCTION: Absolutely NO TEXT, NO WORDS, NO LETTERS, NO FONTS, NO WATERMARKS anywhere in the image. Pure visual photography only.");

        return prompt.toString();
    }
}
