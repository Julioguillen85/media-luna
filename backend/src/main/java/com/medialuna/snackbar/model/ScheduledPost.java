package com.medialuna.snackbar.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_posts")
public class ScheduledPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private Platform platform; // FACEBOOK_PAGE, FACEBOOK_STORY, INSTAGRAM_STORY, INSTAGRAM_REEL

    @Enumerated(EnumType.STRING)
    private PostType postType; // POST, STORY, REEL, GROUP_DRAFT

    @Enumerated(EnumType.STRING)
    private PostStatus status; // DRAFT, SCHEDULED, PUBLISHED, FAILED

    private LocalDateTime scheduledAt;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;

    private String metaPostId; // ID returned by Meta API after publishing
    private String errorMessage; // Error details if failed

    public enum Platform {
        FACEBOOK_PAGE, FACEBOOK_STORY, INSTAGRAM_STORY, INSTAGRAM_REEL
    }

    public enum PostType {
        POST, STORY, REEL, GROUP_DRAFT
    }

    public enum PostStatus {
        DRAFT, SCHEDULED, PUBLISHED, FAILED
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = PostStatus.DRAFT;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Platform getPlatform() {
        return platform;
    }

    public void setPlatform(Platform platform) {
        this.platform = platform;
    }

    public PostType getPostType() {
        return postType;
    }

    public void setPostType(PostType postType) {
        this.postType = postType;
    }

    public PostStatus getStatus() {
        return status;
    }

    public void setStatus(PostStatus status) {
        this.status = status;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getMetaPostId() {
        return metaPostId;
    }

    public void setMetaPostId(String metaPostId) {
        this.metaPostId = metaPostId;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
