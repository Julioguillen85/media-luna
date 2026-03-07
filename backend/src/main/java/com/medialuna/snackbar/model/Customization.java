package com.medialuna.snackbar.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Embeddable
@Data
public class Customization {
    private String size;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> bases;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> complements;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> toppings;
}
