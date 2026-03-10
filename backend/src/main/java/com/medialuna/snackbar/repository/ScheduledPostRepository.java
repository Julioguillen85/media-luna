package com.medialuna.snackbar.repository;

import com.medialuna.snackbar.model.ScheduledPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduledPostRepository extends JpaRepository<ScheduledPost, Long> {

    // Find posts ready to publish (scheduled time has passed and status is
    // SCHEDULED)
    List<ScheduledPost> findByStatusAndScheduledAtBefore(
            ScheduledPost.PostStatus status, LocalDateTime dateTime);

    // Find posts by status
    List<ScheduledPost> findByStatusOrderByScheduledAtAsc(ScheduledPost.PostStatus status);

    // Find posts between dates (for calendar view)
    List<ScheduledPost> findByScheduledAtBetweenOrderByScheduledAtAsc(
            LocalDateTime start, LocalDateTime end);

    // Find posts by platform
    List<ScheduledPost> findByPlatformOrderByScheduledAtDesc(ScheduledPost.Platform platform);

    // Count by status (for dashboard stats)
    long countByStatus(ScheduledPost.PostStatus status);
}
