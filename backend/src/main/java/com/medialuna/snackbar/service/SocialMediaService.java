package com.medialuna.snackbar.service;

import com.medialuna.snackbar.model.MarketingConfig;
import com.medialuna.snackbar.model.ScheduledPost;
import com.medialuna.snackbar.repository.MarketingConfigRepository;
import com.medialuna.snackbar.repository.ScheduledPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SocialMediaService {

    @Value("${meta.page.access.token:DISABLED}")
    private String pageAccessToken;

    @Value("${meta.page.id:DISABLED}")
    private String pageId;

    @Value("${meta.instagram.business.id:DISABLED}")
    private String instagramBusinessId;

    @Autowired
    private ScheduledPostRepository postRepository;

    @Autowired
    private MarketingConfigRepository configRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GRAPH_API_BASE = "https://graph.facebook.com/v18.0";

    /**
     * Check if Meta API is configured
     */
    public boolean isConfigured() {
        return pageAccessToken != null && !pageAccessToken.equals("DISABLED");
    }

    /**
     * Get active config (from DB if available, otherwise from properties)
     */
    private String getPageToken() {
        List<MarketingConfig> configs = configRepository.findAll();
        if (!configs.isEmpty() && configs.get(0).getFacebookPageToken() != null) {
            return configs.get(0).getFacebookPageToken();
        }
        return pageAccessToken;
    }

    private String getPageId() {
        List<MarketingConfig> configs = configRepository.findAll();
        if (!configs.isEmpty() && configs.get(0).getFacebookPageId() != null) {
            return configs.get(0).getFacebookPageId();
        }
        return pageId;
    }

    private String getIgBusinessId() {
        List<MarketingConfig> configs = configRepository.findAll();
        if (!configs.isEmpty() && configs.get(0).getInstagramBusinessId() != null) {
            return configs.get(0).getInstagramBusinessId();
        }
        return instagramBusinessId;
    }

    /**
     * Publish a text/image post to the Facebook Page
     */
    public String publishToFacebookPage(ScheduledPost post) {
        try {
            String token = getPageToken();
            String pid = getPageId();
            if ("DISABLED".equals(token) || "DISABLED".equals(pid)) {
                throw new RuntimeException("Meta API no configurada. Configura los tokens en el panel de Marketing.");
            }

            String url = GRAPH_API_BASE + "/" + pid + "/feed";

            Map<String, Object> body = new HashMap<>();
            body.put("message", post.getContent());
            body.put("access_token", token);

            // If there's an image URL, use /photos endpoint instead
            if (post.getImageUrl() != null && !post.getImageUrl().isEmpty()) {
                url = GRAPH_API_BASE + "/" + pid + "/photos";
                body.put("url", post.getImageUrl());
                body.put("caption", post.getContent());
                body.remove("message");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() != null && response.getBody().get("id") != null) {
                String metaPostId = response.getBody().get("id").toString();
                post.setMetaPostId(metaPostId);
                post.setStatus(ScheduledPost.PostStatus.PUBLISHED);
                post.setPublishedAt(LocalDateTime.now());
                postRepository.save(post);
                return metaPostId;
            }

            throw new RuntimeException("No se recibió ID del post de Meta");
        } catch (Exception e) {
            post.setStatus(ScheduledPost.PostStatus.FAILED);
            post.setErrorMessage(e.getMessage());
            postRepository.save(post);
            throw new RuntimeException("Error publicando en Facebook: " + e.getMessage(), e);
        }
    }

    /**
     * Publish a photo story to the Facebook Page
     */
    public String publishFacebookStory(ScheduledPost post) {
        try {
            String token = getPageToken();
            String pid = getPageId();
            if ("DISABLED".equals(token)) {
                throw new RuntimeException("Meta API no configurada.");
            }

            if (post.getImageUrl() == null || post.getImageUrl().isEmpty()) {
                throw new RuntimeException("Las stories requieren una imagen.");
            }

            // Step 1: Upload photo to page
            String url = GRAPH_API_BASE + "/" + pid + "/photo_stories";

            // First upload the photo
            String uploadUrl = GRAPH_API_BASE + "/" + pid + "/photos";
            Map<String, Object> uploadBody = new HashMap<>();
            uploadBody.put("url", post.getImageUrl());
            uploadBody.put("published", false);
            uploadBody.put("access_token", token);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> uploadEntity = new HttpEntity<>(uploadBody, headers);
            ResponseEntity<Map> uploadResponse = restTemplate.postForEntity(uploadUrl, uploadEntity, Map.class);
            String photoId = uploadResponse.getBody().get("id").toString();

            // Step 2: Create story with the uploaded photo
            Map<String, Object> storyBody = new HashMap<>();
            storyBody.put("photo_id", photoId);
            storyBody.put("access_token", token);

            HttpEntity<Map<String, Object>> storyEntity = new HttpEntity<>(storyBody, headers);
            ResponseEntity<Map> storyResponse = restTemplate.postForEntity(url, storyEntity, Map.class);

            String storyId = storyResponse.getBody().get("id").toString();
            post.setMetaPostId(storyId);
            post.setStatus(ScheduledPost.PostStatus.PUBLISHED);
            post.setPublishedAt(LocalDateTime.now());
            postRepository.save(post);
            return storyId;
        } catch (Exception e) {
            post.setStatus(ScheduledPost.PostStatus.FAILED);
            post.setErrorMessage(e.getMessage());
            postRepository.save(post);
            throw new RuntimeException("Error publicando story en Facebook: " + e.getMessage(), e);
        }
    }

    /**
     * Publish a story to Instagram Business account
     */
    public String publishInstagramStory(ScheduledPost post) {
        try {
            String token = getPageToken(); // Instagram uses the page token
            String igId = getIgBusinessId();
            if ("DISABLED".equals(token) || "DISABLED".equals(igId)) {
                throw new RuntimeException("Instagram API no configurada.");
            }

            if (post.getImageUrl() == null || post.getImageUrl().isEmpty()) {
                throw new RuntimeException("Las stories de Instagram requieren una imagen.");
            }

            // Step 1: Create media container for story
            String createUrl = GRAPH_API_BASE + "/" + igId + "/media";
            Map<String, Object> createBody = new HashMap<>();
            createBody.put("image_url", post.getImageUrl());
            createBody.put("media_type", "STORIES");
            createBody.put("access_token", token);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> createEntity = new HttpEntity<>(createBody, headers);
            ResponseEntity<Map> createResponse = restTemplate.postForEntity(createUrl, createEntity, Map.class);
            String containerId = createResponse.getBody().get("id").toString();

            // Step 2: Publish the container
            String publishUrl = GRAPH_API_BASE + "/" + igId + "/media_publish";
            Map<String, Object> publishBody = new HashMap<>();
            publishBody.put("creation_id", containerId);
            publishBody.put("access_token", token);

            HttpEntity<Map<String, Object>> publishEntity = new HttpEntity<>(publishBody, headers);
            ResponseEntity<Map> publishResponse = restTemplate.postForEntity(publishUrl, publishEntity, Map.class);

            String mediaId = publishResponse.getBody().get("id").toString();
            post.setMetaPostId(mediaId);
            post.setStatus(ScheduledPost.PostStatus.PUBLISHED);
            post.setPublishedAt(LocalDateTime.now());
            postRepository.save(post);
            return mediaId;
        } catch (Exception e) {
            post.setStatus(ScheduledPost.PostStatus.FAILED);
            post.setErrorMessage(e.getMessage());
            postRepository.save(post);
            throw new RuntimeException("Error publicando story en Instagram: " + e.getMessage(), e);
        }
    }

    /**
     * Publish a reel to Instagram
     */
    public String publishInstagramReel(ScheduledPost post) {
        try {
            String token = getPageToken();
            String igId = getIgBusinessId();
            if ("DISABLED".equals(token) || "DISABLED".equals(igId)) {
                throw new RuntimeException("Instagram API no configurada.");
            }

            if (post.getImageUrl() == null || post.getImageUrl().isEmpty()) {
                throw new RuntimeException("Los reels requieren un video URL.");
            }

            // Step 1: Create reel container
            String createUrl = GRAPH_API_BASE + "/" + igId + "/media";
            Map<String, Object> createBody = new HashMap<>();
            createBody.put("video_url", post.getImageUrl());
            createBody.put("caption", post.getContent());
            createBody.put("media_type", "REELS");
            createBody.put("access_token", token);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> createEntity = new HttpEntity<>(createBody, headers);
            ResponseEntity<Map> createResponse = restTemplate.postForEntity(createUrl, createEntity, Map.class);
            String containerId = createResponse.getBody().get("id").toString();

            // Step 2: Wait and publish (reels need processing time)
            Thread.sleep(5000); // Wait 5 seconds for video processing

            String publishUrl = GRAPH_API_BASE + "/" + igId + "/media_publish";
            Map<String, Object> publishBody = new HashMap<>();
            publishBody.put("creation_id", containerId);
            publishBody.put("access_token", token);

            HttpEntity<Map<String, Object>> publishEntity = new HttpEntity<>(publishBody, headers);
            ResponseEntity<Map> publishResponse = restTemplate.postForEntity(publishUrl, publishEntity, Map.class);

            String mediaId = publishResponse.getBody().get("id").toString();
            post.setMetaPostId(mediaId);
            post.setStatus(ScheduledPost.PostStatus.PUBLISHED);
            post.setPublishedAt(LocalDateTime.now());
            postRepository.save(post);
            return mediaId;
        } catch (Exception e) {
            post.setStatus(ScheduledPost.PostStatus.FAILED);
            post.setErrorMessage(e.getMessage());
            postRepository.save(post);
            throw new RuntimeException("Error publicando reel en Instagram: " + e.getMessage(), e);
        }
    }

    /**
     * Process all scheduled posts that are due
     */
    public void processScheduledPosts() {
        List<ScheduledPost> duePosts = postRepository.findByStatusAndScheduledAtBefore(
                ScheduledPost.PostStatus.SCHEDULED, LocalDateTime.now());

        for (ScheduledPost post : duePosts) {
            try {
                log.info("📤 Publicando post programado #{} en {}", post.getId(), post.getPlatform());
                switch (post.getPlatform()) {
                    case FACEBOOK_PAGE:
                        if (post.getPostType() == ScheduledPost.PostType.STORY) {
                            publishFacebookStory(post);
                        } else {
                            publishToFacebookPage(post);
                        }
                        break;
                    case FACEBOOK_STORY:
                        publishFacebookStory(post);
                        break;
                    case INSTAGRAM_STORY:
                        publishInstagramStory(post);
                        break;
                    case INSTAGRAM_REEL:
                        publishInstagramReel(post);
                        break;
                }
                log.info("✅ Post #{} publicado exitosamente", post.getId());
            } catch (Exception e) {
                log.error("❌ Error publicando post #{}: {}", post.getId(), e.getMessage());
            }
        }
    }
}
