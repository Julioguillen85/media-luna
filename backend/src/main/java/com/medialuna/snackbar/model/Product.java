package com.medialuna.snackbar.model;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

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
    
    public Product() {}
    public Product(String name, Double price, String category, String description, String img, List<String> keywords, List<String> gallery) {
        this.name = name; this.price = price; this.category = category; this.description = description; this.img = img; this.keywords = keywords; this.gallery = gallery;
    }
}
