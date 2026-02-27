package com.medialuna.snackbar.repository;

import com.medialuna.snackbar.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import org.springframework.data.repository.query.Param;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByProductId(Long productId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE OrderItem i SET i.productId = NULL WHERE i.productId = :productId")
    void detachProduct(@Param("productId") Long productId);
}
