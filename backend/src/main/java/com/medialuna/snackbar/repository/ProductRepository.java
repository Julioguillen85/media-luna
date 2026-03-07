package com.medialuna.snackbar.repository;

import com.medialuna.snackbar.model.Product;
import com.medialuna.snackbar.model.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByProductType(ProductType productType);
}
