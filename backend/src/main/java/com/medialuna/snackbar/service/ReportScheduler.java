package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.MarketingConfig;
import com.medialuna.snackbar.repository.MarketingConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@EnableScheduling
public class ReportScheduler {

    @Autowired
    private SocialMediaService socialMediaService;

    @Autowired
    private SalesReportService salesReportService;

    @Autowired
    private MarketingConfigRepository configRepository;

    @Value("${report.weekly.day:SUNDAY}")
    private String reportDay;

    @Value("${report.weekly.hour:21}")
    private int reportHour;

    @Value("${report.owner.phone:0000000000}")
    private String ownerPhone;

    @Value("${report.owner.email:admin@medialuna.com}")
    private String ownerEmail;

    /**
     * Check for scheduled posts every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void processScheduledPosts() {
        try {
            socialMediaService.processScheduledPosts();
        } catch (Exception e) {
            log.error("⚠️ Error procesando posts programados", e);
        }
    }

    /**
     * Check every hour if it's time to send the weekly report
     * The report is sent on the configured day at the configured hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    public void checkWeeklyReport() {
        try {
            // Get config from DB first, fallback to properties
            String day = reportDay;
            int hour = reportHour;
            String phone = ownerPhone;
            String email = ownerEmail;
            boolean whatsappEnabled = false;
            boolean emailEnabled = false;

            List<MarketingConfig> configs = configRepository.findAll();
            if (!configs.isEmpty()) {
                MarketingConfig config = configs.get(0);
                if (config.getWhatsappReportDay() != null)
                    day = config.getWhatsappReportDay();
                if (config.getWhatsappReportPhone() != null)
                    phone = config.getWhatsappReportPhone();
                if (config.getEmailReportTo() != null)
                    email = config.getEmailReportTo();
                whatsappEnabled = config.isWhatsappReportEnabled();
                emailEnabled = config.isEmailReportEnabled();
            }

            // Check if today is the report day and current hour matches
            DayOfWeek today = LocalDate.now().getDayOfWeek();
            DayOfWeek targetDay = DayOfWeek.valueOf(day.toUpperCase());
            int currentHour = LocalTime.now().getHour();

            if (today == targetDay && currentHour == hour) {
                log.info("📊 Generando reporte semanal de ventas...");

                if (whatsappEnabled && phone != null && !phone.equals("0000000000")) {
                    salesReportService.sendWhatsAppReport(phone);
                    log.info("✅ Reporte enviado por WhatsApp a {}", phone);
                }

                if (emailEnabled && email != null && !email.equals("admin@medialuna.com")) {
                    salesReportService.sendEmailReport(email);
                    log.info("✅ Reporte enviado por Email a {}", email);
                }
            }
        } catch (Exception e) {
            log.error("⚠️ Error verificando reporte semanal", e);
        }
    }
}
