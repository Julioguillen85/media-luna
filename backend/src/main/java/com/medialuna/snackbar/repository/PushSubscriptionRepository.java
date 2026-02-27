package com.medialuna.snackbar.repository;

import com.medialuna.snackbar.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
}
