import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

export function useSSE(isAdmin) {
    const [lastOrderEvent, setLastOrderEvent] = useState(null);

    useEffect(() => {
        let eventSource = null;

        if (isAdmin) {
            // Conectar al endpoint de SSE exclusivo para admins
            eventSource = new EventSource(`${API_URL}/notifications/stream`);

            eventSource.onopen = () => {
                console.log("🔌 SSE Conectado a notificaciones en tiempo real");
            };

            // Evento manual "NEW_ORDER" (enviado desde Spring Boot)
            eventSource.addEventListener("NEW_ORDER", (e) => {
                try {
                    const data = JSON.parse(e.data);
                    console.log("📢 Nuevo pedido en tiempo real recibido (SSE):", data);
                    setLastOrderEvent(data);
                } catch (err) {
                    console.error("Error parseando evento SSE NEW_ORDER", err);
                }
            });

            // Evento preventivo de red "ping"
            eventSource.addEventListener("ping", (e) => {
                console.log("📶 Ping SSE:", e.data);
            });

            eventSource.onerror = (e) => {
                console.error("❌ Error en conexión SSE", e);
                eventSource.close();
            };
        }

        return () => {
            if (eventSource) {
                console.log("🔌 Desconectando SSE...");
                eventSource.close();
            }
        };
    }, [isAdmin]);

    return { lastOrderEvent, setLastOrderEvent };
}
