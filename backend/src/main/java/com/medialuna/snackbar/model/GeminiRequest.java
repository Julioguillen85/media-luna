package com.medialuna.snackbar.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO para solicitudes a Google Gemini API
 * Formato según: https://ai.google.dev/api/rest/v1beta/models/generateContent
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiRequest {
    private List<Content> contents;
    private GenerationConfig generationConfig;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Content {
        private String role; // "user" o "model"
        private List<Part> parts;

        public Content(String role, String text) {
            this.role = role;
            this.parts = List.of(new Part(text));
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Part {
        private String text;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerationConfig {
        private Double temperature;
        private Integer maxOutputTokens;

        public static GenerationConfig defaultConfig() {
            return new GenerationConfig(0.7, 1024);
        }
    }

    /**
     * Constructor helper para crear request básico
     */
    public static GeminiRequest create(List<ChatMessage> messages) {
        List<Content> contents = new ArrayList<>();

        for (ChatMessage msg : messages) {
            String role = msg.getRole().equals("assistant") ? "model" : msg.getRole();
            // Gemini solo acepta "user" o "model", no "system"
            if (role.equals("system")) {
                // El system message se incluirá en el primer user message
                continue;
            }
            contents.add(new Content(role, msg.getContent()));
        }

        return new GeminiRequest(contents, GenerationConfig.defaultConfig());
    }
}
