package com.medialuna.snackbar.model;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "ingredient_options")
public class IngredientOptions {
    @Id
    private Long id;
    @ElementCollection
    private List<String> bases;
    @ElementCollection
    private List<String> complements;
    @ElementCollection
    private List<String> toppings;
}
