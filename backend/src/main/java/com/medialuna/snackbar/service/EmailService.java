package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.CustomerOrder;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderNotification(CustomerOrder order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            // Use the username configured in application.properties or a fixed noreply
            // For simplicity in this example, we'll send FROM the configured user TO the
            // configured user (self-notification)
            helper.setFrom("julioguillen85@gmail.com");
            helper.setTo("julioguillen85@gmail.com");
            helper.setSubject("Nuevo Pedido #" + order.getId());

            String htmlContent = "<h1>Nuevo Pedido Recibido</h1>" +
                    "<p>Cliente: " + order.getCustomer() + "</p>" +
                    "<p>Total: $" + order.getTotal() + "</p>" +
                    "<a href='https://medialuna-admin.com/orders/" + order.getId() + "'>Ver Pedido</a>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    /**
     * Send a weekly sales report via email with HTML formatting
     */
    public void sendWeeklyReport(String htmlReport, String toEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("julioguillen85@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("📊 Reporte Semanal — Media Luna Snack Bar");
            helper.setText(htmlReport, true);

            mailSender.send(message);
            System.out.println("✅ Reporte semanal enviado por email a " + toEmail);
        } catch (MessagingException e) {
            System.err.println("❌ Error enviando reporte por email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
