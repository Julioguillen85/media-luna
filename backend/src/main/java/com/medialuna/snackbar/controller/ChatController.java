package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.model.ChatRequest;
import com.medialuna.snackbar.model.ChatResponse;
import com.medialuna.snackbar.service.GroqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private GroqService groqService;

    /**
     * Endpoint principal para el chatbot con IA
     * POST /api/chat
     */
    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            // Validar request
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ChatResponse("Por favor envía un mensaje válido"));
            }

            // Obtener respuesta de Groq
            String aiResponse = groqService.chat(
                    request.getMessage(),
                    request.getContext(),
                    request.getBusinessContext());

            // Detectar si hay alguna acción sugerida
            String action = groqService.detectAction(aiResponse, request.getMessage());

            // Construir respuesta
            ChatResponse response = new ChatResponse();
            response.setMessage(aiResponse);
            response.setAction(action);

            // Si hay datos adicionales según la acción
            if (action != null) {
                Map<String, Object> data = new HashMap<>();
                // Aquí se pueden agregar datos específicos según la acción
                response.setData(data);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error en /api/chat: " + e.getMessage());
            e.printStackTrace();

            // Respuesta de fallback en caso de error
            return ResponseEntity.status(500)
                    .body(new ChatResponse("Ups, tuve un problema. ¿Puedes intentar de nuevo? 😅"));
        }
    }

    /**
     * Endpoint para verificar que el servicio está funcionando
     * GET /api/chat/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Lunita IA Chat Service");
        return ResponseEntity.ok(response);
    }
}
