package com.medialuna.snackbar.config;

import com.medialuna.snackbar.model.IngredientOptions;
import com.medialuna.snackbar.model.Product;
import com.medialuna.snackbar.repository.OptionsRepository;
import com.medialuna.snackbar.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DatabaseSeeder {
    @Bean
    CommandLineRunner initDatabase(ProductRepository productRepo, OptionsRepository optionsRepo) {
        return args -> {
            if (optionsRepo.count() == 0) {
                IngredientOptions opts = new IngredientOptions();
                opts.setId(1L);
                opts.setBases(List.of("Sabritas naturales", "Chips fuego", "Ruffles queso", "Doritos nacho", "Takis fuego", "Chips jalapeños", "Sabritas adobada", "Rancheritos", "Tostitos"));
                opts.setComplements(List.of("Cueritos", "Pepino", "Jícama", "Salchicha", "Sandía (Temp)", "Piña", "Mango (Temp)", "Palomitas", "Churros de maíz", "Zanahoria rallada"));
                opts.setToppings(List.of("Manguitos", "Picafresas", "Lombrices", "Cacahuates", "Rellerindos", "Panditas", "Paletas", "Churro loko", "Sandías", "Lombrices ácidas", "Bolitochas de sandía", "Frutitas de gomita", "Tiburones de gomita", "Aros de durazno", "Cacahuate salado"));
                optionsRepo.save(opts);
            }
            if (productRepo.count() == 0) {
                // NOTA: Estas rutas asumen que pondras las imagenes en /frontend/public/images/
                productRepo.saveAll(List.of(
                    new Product("Papas Preparadas (Bowl)", 200.0, "Snacks", "Elige Tamaño (1/4 o 1/2) + Base + Complementos + Toppings.", "/images/papas-preparadas.jpg", List.of("papas", "bowl", "preparadas"), new ArrayList<>()),
                    new Product("Tostilocos", 85.0, "Snacks", "Tostitos con cueritos, jícama, pepino...", "/images/tostilocos.jpg", List.of("tostilocos", "tostitos"), new ArrayList<>()),
                    new Product("Maruchan Preparada", 45.0, "Snacks", "Sopa instantánea con elote y queso.", "/images/maruchan.jpg", List.of("maruchan"), new ArrayList<>()),
                    new Product("Elote en Vaso", 35.0, "Snacks", "Clásico esquite con mayonesa, queso y chile.", "/images/elote.jpg", List.of("elote", "esquite"), new ArrayList<>()),
                    new Product("Tostielote", 90.0, "Snacks", "Tostitos preparados con esquite (elote), queso y crema.", "/images/tostielote.jpg", List.of("tostielote"), new ArrayList<>()),
                    new Product("Duros Preparados", 45.0, "Snacks", "Chicharrón de harina con verdura y crema.", "/images/duros.jpg", List.of("duro"), new ArrayList<>()),
                    new Product("Crepaletas", 55.0, "Snacks", "Crepa en forma de paleta con toppings dulces.", "/images/crepaletas.jpg", List.of("crepa"), new ArrayList<>()),
                    new Product("Fresas con Crema", 75.0, "Snacks", "Fresas frescas con nuestra crema especial.", "/images/fresas.jpg", List.of("fresas"), new ArrayList<>()),
                    new Product("Mini Hotcakes", 60.0, "Snacks", "Porción de hotcakes pequeños.", "/images/hotcakes.jpg", List.of("hotcakes"), new ArrayList<>()),
                    new Product("Paletas de Hielo", 35.0, "Snacks", "Paleta de agua con chamoy y gomitas.", "/images/paletas.jpg", List.of("paleta"), new ArrayList<>()),
                    new Product("Micheladas", 80.0, "Bebidas", "Preparado especial con escarchado de chamoy.", "/images/michelada.jpg", List.of("michelada", "cerveza"), new ArrayList<>()),
                    new Product("Cantaritos", 95.0, "Bebidas", "Estilo Jalisco con toronja, naranja y tequila.", "/images/cantarito.jpg", List.of("cantarito"), new ArrayList<>())
                ));
            }
        };
    }
}
