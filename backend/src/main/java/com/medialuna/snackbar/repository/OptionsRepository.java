package com.medialuna.snackbar.repository;
import com.medialuna.snackbar.model.IngredientOptions;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OptionsRepository extends JpaRepository<IngredientOptions, Long> {}
