package com.medialuna.snackbar.repository;

import com.medialuna.snackbar.model.MarketingConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketingConfigRepository extends JpaRepository<MarketingConfig, Long> {
    // There should only be one config row, fetched by findAll().get(0) or
    // findById(1L)
}
