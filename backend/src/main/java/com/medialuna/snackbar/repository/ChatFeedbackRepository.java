package com.medialuna.snackbar.repository;

import com.medialuna.snackbar.model.ChatFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatFeedbackRepository extends JpaRepository<ChatFeedback, Long> {
}
