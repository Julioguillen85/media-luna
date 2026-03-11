package com.medialuna.snackbar.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseNotificationService {

    // Lista concurrente de emisores activos para notificar a los admins
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        // Timeout de 10 minutos (600,000 ms), o 0 para infinito (puede requerir configuración extra en Nginx/Railway).
        // Usamos un tiempo largo y configuración de Heartbeat por si acaso.
        SseEmitter emitter = new SseEmitter(600_000L);
        
        emitters.add(emitter);
        
        emitter.onCompletion(() -> {
            log.info("SSE Client Disconnected");
            emitters.remove(emitter);
        });
        
        emitter.onTimeout(() -> {
            log.info("SSE Client Timeout");
            emitter.complete();
            emitters.remove(emitter);
        });
        
        emitter.onError((e) -> {
            log.error("SSE Client Error", e);
            emitter.complete();
            emitters.remove(emitter);
        });

        // Enviar un evento inicial pequeño para asegurar que la conexión sirve
        try {
            emitter.send(SseEmitter.event().name("ping").data("CONNECTED"));
        } catch (IOException e) {
            emitter.completeWithError(e);
            emitters.remove(emitter);
        }

        return emitter;
    }

    /**
     * Enviar mensaje a todos los clientes (Solo lo deberían estar escuchando admins)
     */
    public void sendOrderAlert(String jsonData) {
        log.info("📢 Emitiendo SSE a {} clientes conectados...", emitters.size());
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("NEW_ORDER")
                        .data(jsonData));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }
}
