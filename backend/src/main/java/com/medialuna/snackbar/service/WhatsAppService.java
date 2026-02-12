package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.CustomerOrder;
import com.medialuna.snackbar.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

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
            System.out.println("⚠️ WhatsApp API no configurada.");
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
                body.append("• ").append(item.getName()).append("\n");
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
            e.printStackTrace();
        }
    }
}
