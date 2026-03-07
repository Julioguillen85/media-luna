package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.CustomerOrder;
import com.medialuna.snackbar.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WhatsAppService {
    @Value("${whatsapp.api.url:https://graph.facebook.com/v18.0}")
    private String apiUrl;
    @Value("${whatsapp.api.token:DISABLED}")
    private String apiToken;
    @Value("${whatsapp.phone.id:DISABLED}")
    private String phoneId;
    @Value("${whatsapp.business.number:0000000000}")
    private String businessNumber;

    public void sendOrderNotification(CustomerOrder order) {
        if (apiToken == null || apiToken.contains("PON_AQUI") || apiToken.equals("DISABLED")) {
            log.warn("⚠️ WhatsApp API no configurada.");
            return;
        }
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = apiUrl + "/" + phoneId + "/messages";
            StringBuilder body = new StringBuilder();
            body.append("🔔 *NUEVA SOLICITUD* 🔔\n\n");
            body.append("👤 ").append(order.getCustomer()).append("\n");
            body.append("📞 ").append(order.getPhone()).append("\n\n");
            for (OrderItem item : order.getItems()) {
                body.append("• ").append(item.getName());

                String itemNameLower = item.getName() != null ? item.getName().toLowerCase() : "";
                boolean isRental = itemNameLower.contains("tablón") || itemNameLower.contains("tablon") ||
                        itemNameLower.contains("mesa") || itemNameLower.contains("silla") ||
                        itemNameLower.contains("brincolín");

                if (item.getQuantity() != null && item.getQuantity() > 0) {
                    if (isRental) {
                        if (item.getQuantity() > 1) {
                            body.append(" (x").append(item.getQuantity()).append(")");
                        }
                    } else {
                        body.append(item.getQuantity() == 1 ? " (Para 1 persona)"
                                : " (Para " + item.getQuantity() + " personas)");
                        String durationText = item.getQuantity() >= 50 ? "2 horas" : "1 hora y 30 mins";
                        body.append(" [⏱️ ").append(durationText).append("]");
                    }
                }
                body.append("\n");
            }
            if (order.getPaymentLink() != null && !order.getPaymentLink().isEmpty()) {
                body.append("\n💳 *Link de anticipo de Mercado Pago ($500 MXN) generado:*\n");
                body.append(order.getPaymentLink()).append("\n");
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", "52" + businessNumber);
            payload.put("type", "text");
            Map<String, String> text = new HashMap<>();
            text.put("body", body.toString());
            payload.put("text", text);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiToken);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, entity, String.class);
        } catch (Exception e) {
            log.error("Error sending WhatsApp notification", e);
        }
    }

    /**
     * Send a weekly sales report via WhatsApp to the business owner
     */
    public void sendWeeklyReport(String reportText, String phoneNumber) {
        if (apiToken == null || apiToken.contains("PON_AQUI") || apiToken.equals("DISABLED")) {
            log.warn("⚠️ WhatsApp API no configurada — reporte no enviado.");
            log.warn("📊 Reporte que se habría enviado:\n{}", reportText);
            return;
        }
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = apiUrl + "/" + phoneId + "/messages";

            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", "52" + phoneNumber);
            payload.put("type", "text");
            Map<String, String> text = new HashMap<>();
            text.put("body", reportText);
            payload.put("text", text);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiToken);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, entity, String.class);
            log.info("✅ Reporte semanal enviado por WhatsApp a {}", phoneNumber);
        } catch (Exception e) {
            log.error("❌ Error enviando reporte por WhatsApp", e);
        }
    }
}
