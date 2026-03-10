package com.medialuna.snackbar.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO para la respuesta del endpoint /api/chat
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String message;
    private String action; // Ej: "add_product", "start_checkout", null
    private Map<String, Object> data; // Datos adicionales según la acción

    public ChatResponse(String message) {
        this.message = message;
        this.action = null;
        this.data = null;
    }
}
