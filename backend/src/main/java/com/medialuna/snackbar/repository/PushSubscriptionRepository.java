package com.medialuna.snackbar.repository;

import com.medialuna.snackbar.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByRole(String role);

    Optional<PushSubscription> findByEndpoint(String endpoint);
}
