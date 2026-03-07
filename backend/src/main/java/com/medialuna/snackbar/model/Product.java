package com.medialuna.snackbar.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Data
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Double price;
    private String category;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(columnDefinition = "TEXT")
    private String img;
    @ElementCollection
    @CollectionTable(name = "product_gallery", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> gallery;
    @ElementCollection
    private List<String> keywords;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'SNACK'")
    private ProductType productType = ProductType.SNACK;

    @Column(columnDefinition = "TEXT")
    private String specifications;

    private Double rentalPricePerDay;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean visible = true;

    @JsonManagedReference("priceTiers")
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PriceTier> priceTiers;

    @JsonManagedReference("quarterPriceTiers")
    @OneToMany(mappedBy = "quarterProduct", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PriceTier> quarterPriceTiers;

    public Product() {
    }

    public Product(String name, Double price, String category, String description, String img, List<String> keywords,
            List<String> gallery) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.description = description;
        this.img = img;
        this.keywords = keywords;
        this.gallery = gallery;
    }

    // Constructor with tiers
    public Product(String name, Double price, String category, String description, String img, List<String> keywords,
            List<String> gallery, List<PriceTier> priceTiers) {
        this(name, price, category, description, img, keywords, gallery);
        this.priceTiers = priceTiers;
        if (priceTiers != null) {
            priceTiers.forEach(pt -> pt.setProduct(this));
        }
    }

    public void setQuarterPriceTiers(List<PriceTier> quarterPriceTiers) {
        this.quarterPriceTiers = quarterPriceTiers;
        if (quarterPriceTiers != null) {
            quarterPriceTiers.forEach(pt -> pt.setQuarterProduct(this));
        }
    }
}
