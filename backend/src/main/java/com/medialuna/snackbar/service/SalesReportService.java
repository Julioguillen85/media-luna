package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.CustomerOrder;
import com.medialuna.snackbar.model.Product;
import com.medialuna.snackbar.repository.OrderRepository;
import com.medialuna.snackbar.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SalesReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private EmailService emailService;

    /**
     * Generate a weekly sales report as a formatted text
     */
    public Map<String, Object> generateWeeklyReport() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(7);

        List<CustomerOrder> allOrders = orderRepository.findAll();
        List<Product> allProducts = productRepository.findAll();

        // Filter orders from the last 7 days
        List<CustomerOrder> weeklyOrders = allOrders.stream()
                .filter(order -> {
                    LocalDateTime orderDate = order.getCreatedAt();
                    return orderDate != null && orderDate.toLocalDate().isAfter(weekStart.minusDays(1));
                })
                .collect(Collectors.toList());

        // Total orders
        int totalOrders = weeklyOrders.size();

        // Total estimated revenue
        double totalRevenue = weeklyOrders.stream()
                .mapToDouble(order -> {
                    if (order.getItems() == null)
                        return 0;
                    return order.getItems().stream()
                            .mapToDouble(item -> {
                                Product product = allProducts.stream()
                                        .filter(p -> p.getName().equals(item.getName()))
                                        .findFirst().orElse(null);
                                return product != null ? product.getPrice() : 0;
                            })
                            .sum();
                })
                .sum();

        // Top products
        Map<String, Integer> productCounts = new HashMap<>();
        weeklyOrders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().forEach(item -> {
                    productCounts.merge(item.getName(), 1, (a, b) -> a + b);
                });
            }
        });

        List<Map.Entry<String, Integer>> topProducts = productCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toList());

        // Order status distribution
        Map<String, Long> statusCounts = weeklyOrders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getStatus() != null ? order.getStatus() : "PENDING",
                        Collectors.counting()));

        long completedOrders = statusCounts.getOrDefault("COMPLETED", 0L);
        long cancelledOrders = statusCounts.getOrDefault("CANCELLED", 0L);

        // Build result map
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("period", weekStart.format(DateTimeFormatter.ofPattern("dd/MM")) +
                " - " + today.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        report.put("totalOrders", totalOrders);
        report.put("totalRevenue", totalRevenue);
        report.put("completedOrders", completedOrders);
        report.put("cancelledOrders", cancelledOrders);
        report.put("topProducts", topProducts.stream()
                .map(e -> Map.of("name", e.getKey(), "count", e.getValue()))
                .collect(Collectors.toList()));

        return report;
    }

    /**
     * Format report for WhatsApp (plain text with emojis)
     */
    public String formatWhatsAppReport(Map<String, Object> report) {
        StringBuilder sb = new StringBuilder();
        sb.append("📊 *REPORTE SEMANAL MEDIA LUNA* 📊\n");
        sb.append("═══════════════════\n\n");
        sb.append("📅 Periodo: ").append(report.get("period")).append("\n\n");
        sb.append("📦 Total Pedidos: *").append(report.get("totalOrders")).append("*\n");
        sb.append("💰 Ingresos Est.: *$").append(String.format("%.0f", report.get("totalRevenue"))).append("*\n");
        sb.append("✅ Completados: ").append(report.get("completedOrders")).append("\n");
        sb.append("❌ Cancelados: ").append(report.get("cancelledOrders")).append("\n\n");
        sb.append("🏆 *TOP PRODUCTOS:*\n");

        List<Map<String, Object>> topProducts = (List<Map<String, Object>>) report.get("topProducts");
        int rank = 1;
        for (Map<String, Object> product : topProducts) {
            String emoji = rank == 1 ? "🥇" : rank == 2 ? "🥈" : rank == 3 ? "🥉" : "  " + rank + ".";
            sb.append(emoji).append(" ").append(product.get("name"))
                    .append(" (").append(product.get("count")).append(" pedidos)\n");
            rank++;
        }

        sb.append("\n🌙 Generado por Lunita IA");
        return sb.toString();
    }

    /**
     * Format report for Email (HTML)
     */
    public String formatEmailReport(Map<String, Object> report) {
        List<Map<String, Object>> topProducts = (List<Map<String, Object>>) report.get("topProducts");

        StringBuilder productsHtml = new StringBuilder();
        for (Map<String, Object> product : topProducts) {
            productsHtml.append("<tr><td style='padding:8px;border-bottom:1px solid #eee;'>")
                    .append(product.get("name"))
                    .append("</td><td style='padding:8px;border-bottom:1px solid #eee;text-align:center;'>")
                    .append(product.get("count"))
                    .append(" pedidos</td></tr>");
        }

        return String.format(
                """
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                            <div style="background:linear-gradient(135deg,#e11d48,#f43f5e);padding:32px;text-align:center;">
                                <h1 style="color:white;margin:0;font-size:24px;">🌙 Reporte Semanal</h1>
                                <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">Media Luna Snack Bar</p>
                                <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px;">%s</p>
                            </div>
                            <div style="padding:32px;">
                                <div style="display:flex;gap:16px;margin-bottom:24px;">
                                    <div style="flex:1;background:#f0f9ff;padding:16px;border-radius:12px;text-align:center;">
                                        <p style="font-size:28px;font-weight:bold;color:#1e40af;margin:0;">%s</p>
                                        <p style="color:#64748b;margin:4px 0 0;font-size:12px;">PEDIDOS</p>
                                    </div>
                                    <div style="flex:1;background:#f0fdf4;padding:16px;border-radius:12px;text-align:center;">
                                        <p style="font-size:28px;font-weight:bold;color:#166534;margin:0;">$%s</p>
                                        <p style="color:#64748b;margin:4px 0 0;font-size:12px;">INGRESOS</p>
                                    </div>
                                </div>
                                <h3 style="color:#1e293b;margin:0 0 12px;">🏆 Top Productos</h3>
                                <table style="width:100%%;border-collapse:collapse;">%s</table>
                                <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                                <p style="text-align:center;color:#94a3b8;font-size:12px;">Generado por Lunita IA 🌙</p>
                            </div>
                        </div>
                        """,
                report.get("period"),
                report.get("totalOrders"),
                String.format("%.0f", report.get("totalRevenue")),
                productsHtml.toString());
    }

    /**
     * Send the weekly report via WhatsApp
     */
    public void sendWhatsAppReport(String phone) {
        Map<String, Object> report = generateWeeklyReport();
        String text = formatWhatsAppReport(report);
        whatsAppService.sendWeeklyReport(text, phone);
    }

    /**
     * Send the weekly report via Email
     */
    public void sendEmailReport(String toEmail) {
        Map<String, Object> report = generateWeeklyReport();
        String html = formatEmailReport(report);
        emailService.sendWeeklyReport(html, toEmail);
    }
}
