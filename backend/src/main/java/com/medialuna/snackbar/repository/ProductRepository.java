package com.medialuna.snackbar.repository;
import com.medialuna.snackbar.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductRepository extends JpaRepository<Product, Long> {}
