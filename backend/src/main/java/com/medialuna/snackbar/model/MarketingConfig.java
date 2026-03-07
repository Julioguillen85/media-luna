package com.medialuna.snackbar.model;

import jakarta.persistence.*;

@Entity
@Table(name = "marketing_config")
public class MarketingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Facebook Page Config
    private String facebookPageId;

    @Column(columnDefinition = "TEXT")
    private String facebookPageToken;

    // Instagram Config
    private String instagramBusinessId;

    @Column(columnDefinition = "TEXT")
    private String instagramAccessToken;

    // Weekly Report Config
    private boolean whatsappReportEnabled;
    private String whatsappReportDay; // MONDAY, TUESDAY, ... SUNDAY
    private String whatsappReportPhone; // Owner's phone number

    private boolean emailReportEnabled;
    private String emailReportTo; // Owner's email

    // Auto-publishing toggle
    private boolean autoPublishEnabled;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFacebookPageId() {
        return facebookPageId;
    }

    public void setFacebookPageId(String facebookPageId) {
        this.facebookPageId = facebookPageId;
    }

    public String getFacebookPageToken() {
        return facebookPageToken;
    }

    public void setFacebookPageToken(String facebookPageToken) {
        this.facebookPageToken = facebookPageToken;
    }

    public String getInstagramBusinessId() {
        return instagramBusinessId;
    }

    public void setInstagramBusinessId(String instagramBusinessId) {
        this.instagramBusinessId = instagramBusinessId;
    }

    public String getInstagramAccessToken() {
        return instagramAccessToken;
    }

    public void setInstagramAccessToken(String instagramAccessToken) {
        this.instagramAccessToken = instagramAccessToken;
    }

    public boolean isWhatsappReportEnabled() {
        return whatsappReportEnabled;
    }

    public void setWhatsappReportEnabled(boolean whatsappReportEnabled) {
        this.whatsappReportEnabled = whatsappReportEnabled;
    }

    public String getWhatsappReportDay() {
        return whatsappReportDay;
    }

    public void setWhatsappReportDay(String whatsappReportDay) {
        this.whatsappReportDay = whatsappReportDay;
    }

    public String getWhatsappReportPhone() {
        return whatsappReportPhone;
    }

    public void setWhatsappReportPhone(String whatsappReportPhone) {
        this.whatsappReportPhone = whatsappReportPhone;
    }

    public boolean isEmailReportEnabled() {
        return emailReportEnabled;
    }

    public void setEmailReportEnabled(boolean emailReportEnabled) {
        this.emailReportEnabled = emailReportEnabled;
    }

    public String getEmailReportTo() {
        return emailReportTo;
    }

    public void setEmailReportTo(String emailReportTo) {
        this.emailReportTo = emailReportTo;
    }

    public boolean isAutoPublishEnabled() {
        return autoPublishEnabled;
    }

    public void setAutoPublishEnabled(boolean autoPublishEnabled) {
        this.autoPublishEnabled = autoPublishEnabled;
    }
}
