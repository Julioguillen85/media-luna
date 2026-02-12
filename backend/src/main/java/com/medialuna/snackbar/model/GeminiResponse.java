package com.medialuna.snackbar.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para respuestas de Google Gemini API
 * Formato según: https://ai.google.dev/api/rest/v1beta/models/generateContent
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiResponse {
    private List<Candidate> candidates;
    private UsageMetadata usageMetadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Candidate {
        private Content content;
        private String finishReason;
        private Integer index;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Content {
        private List<Part> parts;
        private String role;
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
    public static class UsageMetadata {
        private Integer promptTokenCount;
        private Integer candidatesTokenCount;
        private Integer totalTokenCount;
    }

    /**
     * Helper para extraer el texto de la respuesta
     */
    public String getTextContent() {
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }

        Candidate firstCandidate = candidates.get(0);
        if (firstCandidate.getContent() == null ||
                firstCandidate.getContent().getParts() == null ||
                firstCandidate.getContent().getParts().isEmpty()) {
            return null;
        }

        return firstCandidate.getContent().getParts().get(0).getText();
    }
}
