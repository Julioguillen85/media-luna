package com.medialuna.snackbar.model;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Embeddable
@Data
public class Customization {
    private String size;
    @ElementCollection
    private List<String> bases;
    @ElementCollection
    private List<String> complements;
    @ElementCollection
    private List<String> toppings;
}
