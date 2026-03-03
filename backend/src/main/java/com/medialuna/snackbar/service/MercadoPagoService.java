package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.CustomerOrder;
import com.medialuna.snackbar.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MercadoPagoService {

    @Value("${mercadopago.access.token:APP_USR-7868471373977543-030311-64155b1fcecf930d072fcc02f3c05151-2292631551}")
    private String accessToken;

    private static final String MP_API_PREFERENCE = "https://api.mercadopago.com/checkout/preferences";

    public String generatePaymentLink(CustomerOrder order) {
        if (order == null || order.getTotal() == null || order.getTotal() <= 0) {
            return null;
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        // Set authorization manually to avoid issues with setBearerAuth
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("Content-Type", "application/json");

        // Calculate 50% down payment
        double depositAmount = Math.round((order.getTotal() * 0.5) * 100.0) / 100.0;

        // Item description
        Map<String, Object> item = new HashMap<>();
        item.put("title", "Anticipo 50% - Apartado de Fecha (Pedido #"
                + (order.getId() != null ? order.getId() : "Pendiente") + ")");
        item.put("description", "Anticipo de servicios de Lunita para el evento el día " + order.getDate());
        item.put("quantity", 1);
        item.put("currency_id", "MXN");
        item.put("unit_price", depositAmount);

        List<Map<String, Object>> items = new ArrayList<>();
        items.add(item);

        // Payer info
        Map<String, Object> payer = new HashMap<>();
        if (order.getCustomer() != null && !order.getCustomer().isEmpty()) {
            payer.put("name", order.getCustomer());
        }
        if (order.getEmail() != null && !order.getEmail().isEmpty() && order.getEmail().contains("@")) {
            payer.put("email", order.getEmail());
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("items", items);
        requestBody.put("payer", payer);
        // Expiration or external reference could be added here
        requestBody.put("external_reference", String.valueOf(order.getId()));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    MP_API_PREFERENCE,
                    HttpMethod.POST,
                    request,
                    Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("init_point");
            }
        } catch (Exception e) {
            System.err.println("Error generating MercadoPago link: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }
}
