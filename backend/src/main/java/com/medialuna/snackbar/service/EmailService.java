package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.CustomerOrder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

@Slf4j
@Service
public class EmailService {

    @Value("${resend.api.key:re_DISABLED}")
    private String resendApiKey;

    @Value("${resend.from.email:Media Luna <onboarding@resend.dev>}")
    private String fromEmail;

    @Value("${admin.email:medialuna.frutibar@gmail.com}")
    private String adminEmail;

    @Autowired
    private JavaMailSender mailSender;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    /**
     * Send an email using Resend HTTP API (works on Railway where SMTP is blocked)
     * Fallbacks to SMTP (JavaMailSender) if Resend is not configured.
     */
    private void sendEmail(String to, String subject, String htmlContent) {
        if (resendApiKey == null || resendApiKey.equals("re_DISABLED") || resendApiKey.isBlank()) {
            log.info("⚠️ Resend API key not configured. Fallback to JavaMailSender for: {}", to);
            sendEmailSmtp(to, subject, htmlContent);
            return;
        }
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + resendApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("from", fromEmail);
            body.put("to", List.of(to));
            body.put("subject", subject);
            body.put("html", htmlContent);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Email enviado exitosamente a {} via Resend", to);
            } else {
                log.error("❌ Resend respondió con status {}: {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("❌ Error enviando email via Resend a {}: {}", to, e.getMessage());
        }
    }

    private void sendEmailSmtp(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Email enviado exitosamente a {} via SMTP", to);
        } catch (Exception e) {
            log.error("❌ Error enviando email via SMTP a {}: {}", to, e.getMessage());
        }
    }

    // ── Helper: build items HTML for order emails ──
    private String buildItemsHtml(CustomerOrder order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return "<tr><td colspan='2' style='padding: 10px; text-align: center; color: #999;'>No hay productos en este pedido</td></tr>";
        }
        StringBuilder sb = new StringBuilder();
        for (com.medialuna.snackbar.model.OrderItem item : order.getItems()) {
            sb.append("<tr>");
            sb.append("<td style='padding: 10px; border-bottom: 1px solid #eee;'>")
                    .append("<strong>").append(item.getName());

            String itemNameLower = item.getName() != null ? item.getName().toLowerCase() : "";
            boolean isRental = itemNameLower.contains("tablón") || itemNameLower.contains("tablon") ||
                    itemNameLower.contains("mesa") || itemNameLower.contains("silla") ||
                    itemNameLower.contains("brincolín");

            if (item.getQuantity() != null && item.getQuantity() > 0) {
                if (isRental) {
                    if (item.getQuantity() > 1) {
                        sb.append(" (x").append(item.getQuantity()).append(")");
                    }
                    sb.append("</strong>");
                } else {
                    sb.append(item.getQuantity() == 1 ? " (Para 1 persona)"
                            : " (Para " + item.getQuantity() + " personas)");
                    sb.append("</strong>");
                    String durationText = item.getQuantity() >= 50 ? "2 horas" : "1 hora y 30 minutos";
                    sb.append(
                            "<div style='font-size: 11px; color: #d97706; margin-top: 2px; font-weight: 500;'>⏱️ Servicio de ")
                            .append(durationText).append("</div>");
                }
            } else {
                sb.append("</strong>");
            }

            if (item.getCustomization() != null) {
                boolean isPapas = itemNameLower.contains("papas preparadas");
                boolean isCharola = itemNameLower.contains("charola");

                if (isPapas || isCharola) {
                    sb.append("<div style='font-size: 12px; color: #666; margin-top: 4px;'>");
                    if (isPapas && item.getCustomization().getSize() != null
                            && !item.getCustomization().getSize().isEmpty()) {
                        String sizeStr = item.getCustomization().getSize().equals("quarter") ? "Bowl 1/4"
                                : item.getCustomization().getSize().equals("half") ? "Bowl 1/2"
                                        : item.getCustomization().getSize();
                        sb.append("<b>Tamaño:</b> ").append(sizeStr).append("<br>");
                    }
                    if (item.getCustomization().getBases() != null
                            && !item.getCustomization().getBases().isEmpty()) {
                        sb.append("<b>Base:</b> ").append(String.join(", ", item.getCustomization().getBases()))
                                .append("<br>");
                    }
                    if (item.getCustomization().getComplements() != null
                            && !item.getCustomization().getComplements().isEmpty()) {
                        sb.append("<b>Complementos:</b> ")
                                .append(String.join(", ", item.getCustomization().getComplements()))
                                .append("<br>");
                    }
                    if (item.getCustomization().getToppings() != null
                            && !item.getCustomization().getToppings().isEmpty()) {
                        sb.append("<b>Toppings:</b> ")
                                .append(String.join(", ", item.getCustomization().getToppings()));
                    }
                    sb.append("</div>");
                }
            }
            sb.append("</td>");

            Double itemPrice = item.getPrice() != null ? item.getPrice() : 0.0;
            sb.append("<td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>")
                    .append(item.getPrice() != null ? "$" + String.format("%.2f", itemPrice) : "-")
                    .append("</td>");
            sb.append("</tr>");
        }
        return sb.toString();
    }

    // ── Helper: compute order totals ──
    private double[] computeTotals(CustomerOrder order) {
        double rawSubtotal = 0.0;
        double snackSubtotal = 0.0;
        if (order.getItems() != null) {
            for (com.medialuna.snackbar.model.OrderItem item : order.getItems()) {
                double price = item.getPrice() != null ? item.getPrice() : 0.0;
                rawSubtotal += price;
                String itemNameLower = item.getName() != null ? item.getName().toLowerCase() : "";
                boolean isRental = itemNameLower.contains("tablón") || itemNameLower.contains("tablon") ||
                        itemNameLower.contains("mesa") || itemNameLower.contains("silla") ||
                        itemNameLower.contains("brincolín");
                if (!isRental) {
                    snackSubtotal += price;
                }
            }
        }
        double orderTotal = order.getTotal() != null ? order.getTotal() : rawSubtotal;
        double computedDiscount = 0.0;
        if (snackSubtotal > 0 && orderTotal < rawSubtotal) {
            computedDiscount = rawSubtotal - orderTotal;
        } else if (snackSubtotal > 0) {
            double expectedDiscount = snackSubtotal * 0.15;
            if (Math.abs((rawSubtotal - expectedDiscount) - orderTotal) < 1.0) {
                computedDiscount = expectedDiscount;
            }
        }
        return new double[] { rawSubtotal, orderTotal, computedDiscount };
    }

    @Async
    public void sendOrderNotification(CustomerOrder order) {
        String itemsHtml = buildItemsHtml(order);
        double[] totals = computeTotals(order);
        double rawSubtotal = totals[0];
        double orderTotal = totals[1];
        double computedDiscount = totals[2];

        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;'>"
                +
                "<div style='background-color: #f43f5e; color: white; padding: 20px; text-align: center;'>" +
                "<h1 style='margin: 0; font-size: 24px;'>🌙 Nuevo Pedido Recibido</h1>" +
                "<p style='margin: 5px 0 0 0; opacity: 0.9;'>Folio #" + order.getId() + "</p>" +
                "</div>" +
                "<div style='padding: 20px;'>" +
                "<h2 style='color: #334155; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px;'>Datos del Cliente</h2>"
                +
                "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>" +
                "<tr><td style='padding: 5px 0; color: #64748b; width: 40%;'><strong>Nombre:</strong></td><td style='padding: 5px 0; color: #334155;'>"
                + (order.getCustomer() != null ? order.getCustomer() : "N/A") + "</td></tr>" +
                "<tr><td style='padding: 5px 0; color: #64748b;'><strong>WhatsApp:</strong></td><td style='padding: 5px 0; color: #334155;'>"
                + (order.getPhone() != null ? order.getPhone() : "N/A") + "</td></tr>" +
                "<tr><td style='padding: 5px 0; color: #64748b;'><strong>Correo:</strong></td><td style='padding: 5px 0; color: #334155;'>"
                + (order.getEmail() != null ? order.getEmail() : "N/A") + "</td></tr>" +
                "<tr><td style='padding: 5px 0; color: #64748b;'><strong>Ubicación:</strong></td><td style='padding: 5px 0; color: #334155;'>"
                + (order.getEventLocation() != null ? order.getEventLocation() : "N/A") + "</td></tr>" +
                "<tr><td style='padding: 5px 0; color: #64748b;'><strong>Fecha:</strong></td><td style='padding: 5px 0; color: #334155;'>"
                + (order.getDate() != null ? order.getDate() : "N/A") + "</td></tr>" +
                "<tr><td style='padding: 5px 0; color: #64748b;'><strong>Hora:</strong></td><td style='padding: 5px 0; color: #334155;'>"
                + (order.getTime() != null ? order.getTime() : "N/A") + "</td></tr>" +
                "</table>" +
                "<h2 style='color: #334155; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px;'>Productos</h2>"
                +
                "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>" +
                "<thead><tr style='background-color: #f8fafc;'><th style='padding: 10px; text-align: left; color: #64748b; border-bottom: 2px solid #e2e8f0;'>Detalle</th><th style='padding: 10px; text-align: right; color: #64748b; border-bottom: 2px solid #e2e8f0;'>Precio</th></tr></thead>"
                +
                "<tbody>" + itemsHtml + "</tbody>" +
                "<tfoot>" +
                "<tr><td style='padding: 15px 10px 5px 10px; text-align: right; font-weight: bold; color: #64748b; font-size: 14px;'>Subtotal (sin descuento):</td><td style='padding: 15px 10px 5px 10px; text-align: right; font-weight: bold; color: #64748b; font-size: 14px;'>$"
                + String.format("%.2f", rawSubtotal) + "</td></tr>" +
                (computedDiscount > 0
                        ? "<tr><td style='padding: 5px 10px; text-align: right; font-weight: bold; color: #10b981; font-size: 14px;'>✨ Descuento especial (15% en Snacks):</td><td style='padding: 5px 10px; text-align: right; font-weight: bold; color: #10b981; font-size: 14px;'>-$"
                                + String.format("%.2f", computedDiscount) + "</td></tr>"
                        : "")
                +
                "<tr><td style='padding: 5px 10px 15px 10px; text-align: right; font-weight: bold; color: #334155; font-size: 16px; border-bottom: 2px solid #e2e8f0;'>Total a Pagar:</td><td style='padding: 5px 10px 15px 10px; text-align: right; font-weight: bold; color: #f43f5e; font-size: 18px; border-bottom: 2px solid #e2e8f0;'>$"
                + String.format("%.2f", orderTotal) + "</td></tr>" +
                "</tfoot>" +
                "</table>" +
                "<div style='text-align: center; margin-top: 30px;'>" +
                "<p style='color: #64748b; font-size: 12px; margin-bottom: 15px;'>Este es un comprobante automático de las solicitudes desde la Inteligencia Artificial.</p>"
                +
                "<a href='https://tudominio.com/admin/orders' style='background-color: #1e293b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>Ir al Panel de Administración</a>"
                +
                "</div>" +
                "</div>" +
                "</div>";

        sendEmail(adminEmail, "Nuevo Pedido #" + order.getId(), htmlContent);
    }

    @Async
    public void sendOrderConfirmedEmail(CustomerOrder order) {
        if (order.getEmail() == null || order.getEmail().trim().isEmpty() || order.getEmail().equalsIgnoreCase("N/A")) {
            return;
        }

        String itemsHtml = buildItemsHtml(order);
        double[] totals = computeTotals(order);
        double rawSubtotal = totals[0];
        double orderTotal = totals[1];
        double computedDiscount = totals[2];

        String discountHtml = "";
        if (computedDiscount > 0) {
            discountHtml = "<tr><td style='padding: 10px; text-align: right; color: #64748b; font-size: 14px;'>Total Regular:</td><td style='padding: 10px; text-align: right; color: #64748b; font-size: 14px; text-decoration: line-through;'>$"
                    + String.format("%.2f", rawSubtotal) + "</td></tr>" +
                    "<tr><td style='padding: 5px 10px; text-align: right; color: #ef4444; font-size: 14px;'>✨ Descuento (15% en Snacks):</td><td style='padding: 5px 10px; text-align: right; color: #ef4444; font-size: 14px;'>-$"
                    + String.format("%.2f", computedDiscount) + "</td></tr>";
        }

        String paymentSectionHtml = "";
        if (order.getPaymentLink() != null) {
            double depositAmount = Math.min(500.0, orderTotal);
            double remainingBalance = orderTotal - depositAmount;

            String balanceHtml = "";
            if (remainingBalance > 0) {
                balanceHtml = "<div style='margin-top: 15px;'><span style='color: #0369a1; font-size: 14px; font-weight: bold; background-color: #e0f2fe; padding: 8px 15px; border-radius: 5px; display: inline-block;'>El resto ($"
                        + String.format("%.2f", remainingBalance) + " MXN) se liquida según acordado con Media Luna.</span></div>";
            }

            paymentSectionHtml = "<div style='text-align: center; margin-top: 30px; background-color: #f0f9ff; padding: 25px; border-radius: 8px; border-left: 4px solid #009ee3;'>"
                    + "<h3 style='color: #0369a1; margin-top: 0; font-size: 18px;'>💳 Aparta tu fecha</h3>"
                    + "<p style='color: #334155; font-size: 15px; margin-bottom: 20px; line-height: 1.5;'>Para asegurar tu reservación, puedes realizar el pago de tu anticipo de <strong>$"
                    + String.format("%.2f", depositAmount)
                    + " MXN</strong> de forma rápida y segura a través de Mercado Pago.</p>"
                    + "<a href='" + order.getPaymentLink()
                    + "' style='background-color: #009ee3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; width: 80%; max-width: 300px;'>Pagar Anticipo de $"
                    + String.format("%.2f", depositAmount) + "</a>"
                    + balanceHtml
                    + "<p style='color: #64748b; font-size: 14px; margin-top: 25px; margin-bottom: 15px;'>¿Prefieres pagar por transferencia o necesitas ayuda?</p>"
                    + "<a href='https://wa.me/523123099318?text=Hola,%20tengo%20dudas%20con%20el%20pago%20de%20mi%20pedido%20%23"
                    + order.getId()
                    + "' style='background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; width: 80%; max-width: 300px;'>Contactar por WhatsApp</a>"
                    + "</div>";
        }

        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;'>"
                +
                "<div style='background-color: #10b981; color: white; padding: 20px; text-align: center;'>" +
                "<h1 style='margin: 0; font-size: 24px;'>🎉 ¡Tu Pedido está Confirmado!</h1>" +
                "<p style='margin: 5px 0 0 0; opacity: 0.9;'>Folio #" + order.getId() + "</p>" +
                "</div>" +
                "<div style='padding: 20px;'>" +
                "<p style='color: #334155; font-size: 16px; line-height: 1.5;'>Hola <strong>"
                + (order.getCustomer() != null ? order.getCustomer() : "") + "</strong>,</p>" +
                "<p style='color: #475569; font-size: 15px; line-height: 1.5;'>Nos emociona informarte que tu pedido para el evento del <strong>"
                + (order.getDate() != null ? order.getDate() : "N/A") + "</strong> a las <strong>"
                + (order.getTime() != null ? order.getTime() : "N/A")
                + "</strong> ha sido confirmado oficialmente por nuestro equipo. 🥳</p>" +
                "<h2 style='color: #334155; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 25px; margin-bottom: 15px;'>Resumen de tu Pedido</h2>"
                +
                "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>" +
                "<thead><tr style='background-color: #f8fafc;'><th style='padding: 10px; text-align: left; color: #64748b; border-bottom: 2px solid #e2e8f0;'>Detalle</th><th style='padding: 10px; text-align: right; color: #64748b; border-bottom: 2px solid #e2e8f0;'>Precio</th></tr></thead>"
                +
                "<tbody>" + itemsHtml + "</tbody>" +
                "<tfoot>" +
                discountHtml +
                "<tr><td style='padding: 15px 10px 5px 10px; text-align: right; font-weight: bold; color: #64748b; font-size: 14px;'>A Pagar:</td><td style='padding: 15px 10px 5px 10px; text-align: right; font-weight: bold; color: #10b981; font-size: 16px;'>$"
                + String.format("%.2f", orderTotal) + "</td></tr>" +
                "</tfoot>" +
                "</table>" +
                paymentSectionHtml +
                "<div style='text-align: center; margin-top: 30px; background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;'>"
                +
                "<h3 style='color: #475569; margin-top: 0; font-size: 16px; margin-bottom: 8px;'>Políticas de Reservación</h3>"
                +
                "<p style='color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;'>Te recordamos que <strong>no hay reembolsos por cancelación</strong> y requerimos un aviso con al menos <strong>10 días de anticipación</strong> para reagendar cualquier fecha sujeta a disponibilidad.</p>"
                +
                "</div>" +
                "<div style='text-align: center; margin-top: 15px; background-color: #f8fafc; padding: 15px; border-radius: 8px;'>"
                +
                "<p style='color: #64748b; font-size: 14px; margin: 0;'>Ponte en contacto con nosotros vía WhatsApp en cualquier momento respondiendo a nuestros mensajes si tienes dudas sobre tu pedido.</p>"
                +
                "</div>" +
                "</div>" +
                "</div>";

        sendEmail(order.getEmail(), "✅ Tu Pedido #" + order.getId() + " está Confirmado", htmlContent);
    }

    @Async
    public void sendOrderCompletedEmail(CustomerOrder order) {
        if (order.getEmail() == null || order.getEmail().trim().isEmpty() || order.getEmail().equalsIgnoreCase("N/A")) {
            return;
        }

        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;'>"
                +
                "<div style='background-color: #f59e0b; color: white; padding: 25px; text-align: center;'>" +
                "<h1 style='margin: 0; font-size: 26px;'>✨ ¡Evento Completado!</h1>" +
                "</div>" +
                "<div style='padding: 30px 20px;'>" +
                "<h2 style='color: #334155; font-size: 20px; margin-top: 0;'>¡Hola "
                + (order.getCustomer() != null ? order.getCustomer() : "") + "! 👋</h2>" +
                "<p style='color: #475569; font-size: 16px; line-height: 1.6;'>Queremos agradecerte de todo corazón por haber confiado en <strong>Media Luna Snack Bar</strong> para deleitar a los invitados de tu evento. Esperamos sinceramente que nuestros servicios hayan superado tus expectativas y que todos hayan disfrutado de los snacks.</p>"
                +
                "<p style='color: #475569; font-size: 16px; line-height: 1.6;'>Para nosotros es un honor ser parte de tus celebraciones especiales. ¡Nos encantaría verte de nuevo en tu próximo evento!</p>"
                +
                "<div style='text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9;'>"
                +
                "<p style='color: #94a3b8; font-size: 14px;'>El equipo de Media Luna 🌙</p>" +
                "</div>" +
                "</div>" +
                "</div>";

        sendEmail(order.getEmail(), "🌟 ¡Gracias por elegir a Media Luna Snack Bar!", htmlContent);
    }

    /**
     * Send a weekly sales report via email with HTML formatting
     */
    @Async
    public void sendWeeklyReport(String htmlReport, String toEmail) {
        sendEmail(toEmail, "📊 Reporte Semanal — Media Luna Snack Bar", htmlReport);
    }
}
