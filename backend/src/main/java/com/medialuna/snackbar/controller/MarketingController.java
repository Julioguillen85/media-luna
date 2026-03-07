package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.model.MarketingConfig;
import com.medialuna.snackbar.model.ScheduledPost;
import com.medialuna.snackbar.repository.MarketingConfigRepository;
import com.medialuna.snackbar.repository.ScheduledPostRepository;
import com.medialuna.snackbar.service.ContentGeneratorService;
import com.medialuna.snackbar.service.ImageGenerationService;
import com.medialuna.snackbar.service.SalesReportService;
import com.medialuna.snackbar.service.SocialMediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/marketing")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class MarketingController {

    @Autowired
    private ScheduledPostRepository postRepository;

    @Autowired
    private MarketingConfigRepository configRepository;

    @Autowired
    private SocialMediaService socialMediaService;

    @Autowired
    private ContentGeneratorService contentGeneratorService;

    @Autowired
    private SalesReportService salesReportService;

    @Autowired
    private ImageGenerationService imageGenerationService;

    // ==================== POSTS CRUD ====================

    /**
     * GET /api/marketing/posts — List all posts (optionally filter by date range)
     */
    @GetMapping("/posts")
    public ResponseEntity<List<ScheduledPost>> listPosts(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            List<ScheduledPost> posts;
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDateTime.parse(startDate);
                LocalDateTime end = LocalDateTime.parse(endDate);
                posts = postRepository.findByScheduledAtBetweenOrderByScheduledAtAsc(start, end);
            } else {
                posts = postRepository.findAll();
                posts.sort((a, b) -> {
                    if (a.getScheduledAt() == null)
                        return 1;
                    if (b.getScheduledAt() == null)
                        return -1;
                    return b.getScheduledAt().compareTo(a.getScheduledAt());
                });
            }
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }

    /**
     * POST /api/marketing/posts — Create/schedule a post
     */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody ScheduledPost post) {
        try {
            if (post.getScheduledAt() != null && post.getStatus() == null) {
                post.setStatus(ScheduledPost.PostStatus.SCHEDULED);
            }
            ScheduledPost saved = postRepository.save(post);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/marketing/posts/{id} — Update a post
     */
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody ScheduledPost postUpdate) {
        try {
            Optional<ScheduledPost> existing = postRepository.findById(id);
            if (existing.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            ScheduledPost post = existing.get();
            if (postUpdate.getContent() != null)
                post.setContent(postUpdate.getContent());
            if (postUpdate.getImageUrl() != null)
                post.setImageUrl(postUpdate.getImageUrl());
            if (postUpdate.getPlatform() != null)
                post.setPlatform(postUpdate.getPlatform());
            if (postUpdate.getPostType() != null)
                post.setPostType(postUpdate.getPostType());
            if (postUpdate.getStatus() != null)
                post.setStatus(postUpdate.getStatus());
            if (postUpdate.getScheduledAt() != null)
                post.setScheduledAt(postUpdate.getScheduledAt());

            ScheduledPost saved = postRepository.save(post);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/marketing/posts/{id} — Delete a post
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            if (!postRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            postRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Post eliminado"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/marketing/posts/{id}/publish — Publish a post immediately
     */
    @PostMapping("/posts/{id}/publish")
    public ResponseEntity<?> publishPost(@PathVariable Long id) {
        try {
            Optional<ScheduledPost> existing = postRepository.findById(id);
            if (existing.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            ScheduledPost post = existing.get();
            String metaId;

            switch (post.getPlatform()) {
                case FACEBOOK_PAGE:
                    if (post.getPostType() == ScheduledPost.PostType.STORY) {
                        metaId = socialMediaService.publishFacebookStory(post);
                    } else {
                        metaId = socialMediaService.publishToFacebookPage(post);
                    }
                    break;
                case FACEBOOK_STORY:
                    metaId = socialMediaService.publishFacebookStory(post);
                    break;
                case INSTAGRAM_STORY:
                    metaId = socialMediaService.publishInstagramStory(post);
                    break;
                case INSTAGRAM_REEL:
                    metaId = socialMediaService.publishInstagramReel(post);
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Plataforma no soportada para publicación directa"));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Post publicado exitosamente",
                    "metaPostId", metaId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== DASHBOARD STATS ====================

    /**
     * GET /api/marketing/stats — Get dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("totalPosts", postRepository.count());
            stats.put("drafts", postRepository.countByStatus(ScheduledPost.PostStatus.DRAFT));
            stats.put("scheduled", postRepository.countByStatus(ScheduledPost.PostStatus.SCHEDULED));
            stats.put("published", postRepository.countByStatus(ScheduledPost.PostStatus.PUBLISHED));
            stats.put("failed", postRepository.countByStatus(ScheduledPost.PostStatus.FAILED));
            stats.put("metaConfigured", socialMediaService.isConfigured());
            stats.put("imageGenConfigured", imageGenerationService.isConfigured());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== AI CONTENT GENERATION ====================

    /**
     * POST /api/marketing/generate — Generate content with AI
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateContent(@RequestBody Map<String, Object> request) {
        try {
            String tone = (String) request.getOrDefault("tone", "divertido");
            String occasion = (String) request.getOrDefault("occasion", "publicación diaria");
            String platform = (String) request.getOrDefault("platform", "FACEBOOK_PAGE");
            @SuppressWarnings("unchecked")
            List<String> products = (List<String>) request.get("products");

            String content;
            if ("GROUP".equalsIgnoreCase(platform)) {
                content = contentGeneratorService.generateGroupDraft(products);
            } else {
                content = contentGeneratorService.generatePromoPost(tone, occasion, products, platform);
            }

            return ResponseEntity.ok(Map.of("content", content));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/marketing/generate-design — Generate a unique poster design with AI
     */
    @PostMapping("/generate-design")
    public ResponseEntity<?> generateDesign(@RequestBody Map<String, Object> request) {
        try {
            String tone = (String) request.getOrDefault("tone", "divertido");
            String occasion = (String) request.getOrDefault("occasion", "publicación del día");
            @SuppressWarnings("unchecked")
            List<String> products = (List<String>) request.get("products");
            int productCount = request.containsKey("productCount")
                    ? ((Number) request.get("productCount")).intValue()
                    : (products != null ? products.size() : 4);

            String designJson = contentGeneratorService.generatePosterDesign(tone, occasion, products, productCount);
            return ResponseEntity.ok(Map.of("design", designJson));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/marketing/schedule-suggestion — Get an AI-suggested weekly schedule
     */
    @GetMapping("/schedule-suggestion")
    public ResponseEntity<?> getScheduleSuggestion() {
        try {
            String suggestion = contentGeneratorService.suggestWeeklySchedule();
            return ResponseEntity.ok(Map.of("schedule", suggestion));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== IMAGE GENERATION ====================

    /**
     * POST /api/marketing/generate-image — Generate a promotional image with AI
     * Accepts: product, style, generatedText (the AI-generated marketing text for
     * context)
     */
    @SuppressWarnings("unchecked")
    @PostMapping("/generate-image")
    public ResponseEntity<?> generateImage(@RequestBody Map<String, Object> request) {
        try {
            String product = (String) request.getOrDefault("product", "");
            String style = (String) request.getOrDefault("style", "moderno");
            String generatedText = (String) request.get("generatedText");
            List<String> images = (List<String>) request.get("images");

            String prompt = imageGenerationService.buildPromoPrompt(product, style, generatedText);
            String imageData = imageGenerationService.generateImageWithReferences(prompt, images);

            return ResponseEntity.ok(Map.of(
                    "imageUrl", imageData,
                    "prompt", prompt));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== MARKETING CONFIG ====================

    /**
     * GET /api/marketing/config — Get marketing configuration
     */
    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        try {
            List<MarketingConfig> configs = configRepository.findAll();
            if (configs.isEmpty()) {
                // Return a default empty config
                MarketingConfig defaultConfig = new MarketingConfig();
                defaultConfig.setWhatsappReportDay("SUNDAY");
                return ResponseEntity.ok(defaultConfig);
            }
            return ResponseEntity.ok(configs.get(0));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/marketing/config — Update marketing configuration
     */
    @PutMapping("/config")
    public ResponseEntity<?> updateConfig(@RequestBody MarketingConfig configUpdate) {
        try {
            List<MarketingConfig> configs = configRepository.findAll();
            MarketingConfig config;
            if (configs.isEmpty()) {
                config = new MarketingConfig();
            } else {
                config = configs.get(0);
            }

            // Update fields
            if (configUpdate.getFacebookPageId() != null)
                config.setFacebookPageId(configUpdate.getFacebookPageId());
            if (configUpdate.getFacebookPageToken() != null)
                config.setFacebookPageToken(configUpdate.getFacebookPageToken());
            if (configUpdate.getInstagramBusinessId() != null)
                config.setInstagramBusinessId(configUpdate.getInstagramBusinessId());
            if (configUpdate.getInstagramAccessToken() != null)
                config.setInstagramAccessToken(configUpdate.getInstagramAccessToken());

            config.setWhatsappReportEnabled(configUpdate.isWhatsappReportEnabled());
            if (configUpdate.getWhatsappReportDay() != null)
                config.setWhatsappReportDay(configUpdate.getWhatsappReportDay());
            if (configUpdate.getWhatsappReportPhone() != null)
                config.setWhatsappReportPhone(configUpdate.getWhatsappReportPhone());

            config.setEmailReportEnabled(configUpdate.isEmailReportEnabled());
            if (configUpdate.getEmailReportTo() != null)
                config.setEmailReportTo(configUpdate.getEmailReportTo());

            config.setAutoPublishEnabled(configUpdate.isAutoPublishEnabled());

            MarketingConfig saved = configRepository.save(config);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== SALES REPORTS ====================

    /**
     * GET /api/marketing/report/preview — Preview the weekly sales report
     */
    @GetMapping("/report/preview")
    public ResponseEntity<?> previewReport() {
        try {
            Map<String, Object> report = salesReportService.generateWeeklyReport();
            String whatsappText = salesReportService.formatWhatsAppReport(report);
            String emailHtml = salesReportService.formatEmailReport(report);

            Map<String, Object> preview = new LinkedHashMap<>();
            preview.put("data", report);
            preview.put("whatsappText", whatsappText);
            preview.put("emailHtml", emailHtml);

            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/marketing/report/send — Send the report now (test)
     */
    @PostMapping("/report/send")
    public ResponseEntity<?> sendReport(@RequestBody Map<String, String> request) {
        try {
            String channel = request.getOrDefault("channel", "email");
            String to = request.get("to");

            if (to == null || to.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Especifica el destinatario en 'to'"));
            }

            if ("whatsapp".equalsIgnoreCase(channel)) {
                salesReportService.sendWhatsAppReport(to);
            } else {
                salesReportService.sendEmailReport(to);
            }

            return ResponseEntity.ok(Map.of("message", "Reporte enviado por " + channel + " a " + to));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
