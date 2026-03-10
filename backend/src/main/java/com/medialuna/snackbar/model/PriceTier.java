package com.medialuna.snackbar.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@Table(name = "price_tiers")
public class PriceTier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer minGuests;
    private Integer maxGuests;
    private Double price; // Total price for this range of guests (or per unit if decided otherwise, but
                          // user data shows Total)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonBackReference("priceTiers")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quarter_product_id")
    @JsonBackReference("quarterPriceTiers")
    private Product quarterProduct;

    public PriceTier() {
    }

    public PriceTier(Integer minGuests, Integer maxGuests, Double price) {
        this.minGuests = minGuests;
        this.maxGuests = maxGuests;
        this.price = price;
    }
}
