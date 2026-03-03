package com.medialuna.snackbar.config;

import com.medialuna.snackbar.model.IngredientOptions;
import com.medialuna.snackbar.model.Product;
import com.medialuna.snackbar.model.PriceTier;
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
                                opts.setBases(List.of("Sabritas naturales", "Chips fuego", "Ruffles queso",
                                                "Doritos nacho",
                                                "Takis fuego", "Chips jalapeños", "Sabritas adobada", "Rancheritos",
                                                "Tostitos"));
                                opts.setComplements(List.of("Cueritos", "Pepino", "Jícama", "Salchicha",
                                                "Sandía (Temp)", "Piña",
                                                "Mango (Temp)", "Palomitas", "Churros de maíz", "Zanahoria rallada"));
                                opts.setToppings(List.of("Manguitos", "Picafresas", "Lombrices", "Cacahuates",
                                                "Rellerindos",
                                                "Panditas", "Paletas", "Churro loko", "Sandías", "Lombrices ácidas",
                                                "Bolitochas de sandía",
                                                "Frutitas de gomita", "Tiburones de gomita", "Aros de durazno",
                                                "Cacahuate salado"));
                                optionsRepo.save(opts);
                        }
                        if (productRepo.count() == 0) {
                                // NOTA: Estas rutas asumen que pondras las imagenes en /frontend/public/images/
                                // Helper to create tiers
                                // --- TIERS GENERATION ---
                                List<PriceTier> eloteTiers = List.of(
                                                new PriceTier(30, 39, 1500.0), new PriceTier(40, 49, 2000.0),
                                                new PriceTier(50, 59, 2500.0),
                                                new PriceTier(60, 69, 2820.0), new PriceTier(70, 79, 3290.0),
                                                new PriceTier(80, 89, 3760.0),
                                                new PriceTier(90, 99, 4230.0), new PriceTier(100, 109, 4500.0),
                                                new PriceTier(110, 119, 4950.0),
                                                new PriceTier(120, 129, 5400.0), new PriceTier(130, 139, 5850.0),
                                                new PriceTier(140, 149, 6300.0),
                                                new PriceTier(150, 159, 6750.0), new PriceTier(160, 169, 7200.0),
                                                new PriceTier(170, 179, 7650.0),
                                                new PriceTier(180, 189, 8100.0), new PriceTier(190, 199, 8550.0),
                                                new PriceTier(200, 999, 9000.0));

                                List<PriceTier> tostieloteTiers = List.of(
                                                new PriceTier(30, 39, 2550.0), new PriceTier(40, 49, 3400.0),
                                                new PriceTier(50, 59, 4250.0),
                                                new PriceTier(60, 69, 4800.0), new PriceTier(70, 79, 5600.0),
                                                new PriceTier(80, 89, 6400.0),
                                                new PriceTier(90, 99, 7200.0), new PriceTier(100, 109, 7500.0),
                                                new PriceTier(110, 119, 8250.0),
                                                new PriceTier(120, 129, 9000.0), new PriceTier(130, 139, 9750.0),
                                                new PriceTier(140, 149, 10500.0),
                                                new PriceTier(150, 159, 11250.0), new PriceTier(160, 169, 12000.0),
                                                new PriceTier(170, 179, 12750.0),
                                                new PriceTier(180, 189, 13500.0), new PriceTier(190, 199, 14250.0),
                                                new PriceTier(200, 999, 15000.0));

                                List<PriceTier> bowlGrandeTiers = List.of(
                                                new PriceTier(30, 39, 2550.0), new PriceTier(40, 49, 3400.0),
                                                new PriceTier(50, 59, 4250.0),
                                                new PriceTier(60, 69, 4800.0), new PriceTier(70, 79, 5600.0),
                                                new PriceTier(80, 89, 5600.0),
                                                new PriceTier(90, 99, 6300.0), new PriceTier(100, 149, 6800.0),
                                                new PriceTier(150, 199, 10200.0),
                                                new PriceTier(200, 999, 13600.0));

                                List<PriceTier> bowlChicoTiers = new ArrayList<>(List.of(
                                                new PriceTier(30, 39, 1950.0), new PriceTier(40, 49, 2600.0),
                                                new PriceTier(50, 59, 3250.0),
                                                new PriceTier(60, 69, 3600.0), new PriceTier(70, 79, 4200.0),
                                                new PriceTier(80, 89, 4800.0),
                                                new PriceTier(90, 99, 5400.0), new PriceTier(100, 149, 5500.0),
                                                new PriceTier(150, 199, 8250.0),
                                                new PriceTier(200, 999, 11000.0)));

                                List<PriceTier> postresTiers = List.of(
                                                new PriceTier(30, 39, 1950.0), new PriceTier(40, 49, 2600.0),
                                                new PriceTier(50, 59, 3000.0),
                                                new PriceTier(60, 69, 3600.0), new PriceTier(70, 79, 4200.0),
                                                new PriceTier(80, 89, 4800.0),
                                                new PriceTier(90, 99, 4950.0), new PriceTier(100, 149, 5500.0),
                                                new PriceTier(150, 199, 8250.0),
                                                new PriceTier(200, 999, 11000.0));

                                List<PriceTier> fresasTiers = List.of(
                                                new PriceTier(30, 39, 1650.0), new PriceTier(40, 49, 2200.0),
                                                new PriceTier(50, 59, 2750.0),
                                                new PriceTier(60, 79, 3000.0), new PriceTier(80, 99, 4000.0),
                                                new PriceTier(100, 149, 5000.0),
                                                new PriceTier(150, 199, 7500.0), new PriceTier(200, 999, 10000.0));

                                List<PriceTier> tostilocosTiers = List.of(
                                                new PriceTier(30, 49, 2550.0), new PriceTier(50, 79, 4000.0),
                                                new PriceTier(80, 99, 6400.0),
                                                new PriceTier(100, 149, 7500.0), new PriceTier(150, 199, 11250.0),
                                                new PriceTier(200, 999, 15000.0));

                                List<PriceTier> maruchanTiers = List.of(
                                                new PriceTier(30, 49, 2550.0), new PriceTier(50, 79, 3750.0),
                                                new PriceTier(80, 99, 6000.0),
                                                new PriceTier(100, 149, 7000.0), new PriceTier(150, 199, 10500.0),
                                                new PriceTier(200, 999, 14000.0));

                                List<PriceTier> durosTiers = List.of(
                                                new PriceTier(30, 49, 1800.0), new PriceTier(50, 79, 3000.0),
                                                new PriceTier(80, 99, 4400.0),
                                                new PriceTier(100, 149, 5200.0), new PriceTier(150, 199, 7800.0),
                                                new PriceTier(200, 999, 10400.0));

                                List<PriceTier> paletasTiers = List.of(
                                                new PriceTier(30, 49, 1500.0), new PriceTier(50, 79, 2250.0),
                                                new PriceTier(80, 99, 3600.0),
                                                new PriceTier(100, 149, 4000.0), new PriceTier(150, 199, 6000.0),
                                                new PriceTier(200, 999, 8000.0));

                                List<PriceTier> micheladasTiers = List.of(
                                                new PriceTier(30, 49, 2040.0), new PriceTier(50, 79, 3250.0),
                                                new PriceTier(80, 99, 5200.0),
                                                new PriceTier(100, 149, 6000.0), new PriceTier(150, 199, 9000.0),
                                                new PriceTier(200, 999, 12000.0));

                                List<PriceTier> cantaritosTiers = List.of(
                                                new PriceTier(30, 49, 2400.0), new PriceTier(50, 79, 3500.0),
                                                new PriceTier(80, 99, 5600.0),
                                                new PriceTier(100, 149, 6500.0), new PriceTier(150, 199, 9750.0),
                                                new PriceTier(200, 999, 13000.0));

                                Product papas = new Product("Papas Preparadas (Bowl)", 200.0, "Snacks",
                                                "Elige Tamaño (1/4 o 1/2). Precios por volumen: priceTiers=Bowl 1/2, quarterPriceTiers=Bowl 1/4.",
                                                "/images/papas-preparadas.jpg",
                                                List.of("papas", "bowl", "preparadas"),
                                                new ArrayList<>(), bowlGrandeTiers);
                                papas.setQuarterPriceTiers(bowlChicoTiers);

                                productRepo.saveAll(List.of(
                                                new Product("Elote en Vaso", 35.0, "Snacks",
                                                                "Clásico esquite con mayonesa, queso y chile (Ver precios por volumen para eventos).",
                                                                "/images/elote.jpg", List.of("elote", "esquite"),
                                                                new ArrayList<>(), eloteTiers),
                                                papas,
                                                new Product("Tostilocos", 85.0, "Snacks",
                                                                "Tostitos con cueritos, jícama, pepino...",
                                                                "/images/tostilocos.jpg",
                                                                List.of("tostilocos", "tostitos"), new ArrayList<>(),
                                                                tostilocosTiers),
                                                new Product("Maruchan Preparada", 45.0, "Snacks",
                                                                "Sopa instantánea con elote y queso.",
                                                                "/images/maruchan.jpg", List.of("maruchan"),
                                                                new ArrayList<>(), maruchanTiers),
                                                new Product("Tostielote", 90.0, "Snacks",
                                                                "Tostitos preparados con esquite (elote), queso y crema.",
                                                                "/images/tostielote.jpg",
                                                                List.of("tostielote"), new ArrayList<>(),
                                                                tostieloteTiers),
                                                new Product("Duros Preparados", 45.0, "Snacks",
                                                                "Chicharrón de harina con verdura y crema.",
                                                                "/images/duros.jpg", List.of("durito", "duro"),
                                                                new ArrayList<>(), durosTiers),
                                                new Product("Crepaletas", 55.0, "Snacks",
                                                                "Crepa en forma de paleta con toppings dulces.",
                                                                "/images/crepaletas.jpg",
                                                                List.of("crepa", "crepaleta", "postre"),
                                                                new ArrayList<>(), postresTiers),
                                                new Product("Fresas con Crema", 75.0, "Snacks",
                                                                "Fresas frescas con nuestra crema especial.",
                                                                "/images/fresas.jpg", List.of("fresas", "fresa"),
                                                                new ArrayList<>(), fresasTiers),
                                                new Product("Mini Hotcakes", 60.0, "Snacks",
                                                                "Porción de hotcakes pequeños.",
                                                                "/images/hotcakes.jpg", List.of("hotcakes"),
                                                                new ArrayList<>(), postresTiers), // Reusing
                                                                                                  // postresTiers
                                                new Product("Paletas de Hielo", 35.0, "Snacks",
                                                                "Paleta de agua con chamoy y gomitas.",
                                                                "/images/paletas.jpg", List.of("paleta"),
                                                                new ArrayList<>(), paletasTiers),
                                                new Product("Micheladas", 80.0, "Bebidas",
                                                                "Preparado especial con escarchado de chamoy. Mismo costo por volumen para Azulitos.",
                                                                "/images/michelada.jpg",
                                                                List.of("michelada", "cerveza", "azulitos", "azulito"),
                                                                new ArrayList<>(), micheladasTiers),
                                                new Product("Cantaritos", 95.0, "Bebidas",
                                                                "Estilo Jalisco con toronja, naranja y tequila.",
                                                                "/images/cantarito.jpg", List.of("cantarito"),
                                                                new ArrayList<>(), cantaritosTiers)));
                        }

                        // ── MIGRATION: Populate Bowl 1/4 quarterPriceTiers for existing products ──
                        productRepo.findAll().stream()
                                        .filter(p -> p.getName().contains("Papas Preparadas"))
                                        .filter(p -> p.getQuarterPriceTiers() == null
                                                        || p.getQuarterPriceTiers().isEmpty())
                                        .forEach(p -> {
                                                List<PriceTier> qt = new ArrayList<>(List.of(
                                                                new PriceTier(30, 39, 1950.0),
                                                                new PriceTier(40, 49, 2600.0),
                                                                new PriceTier(50, 59, 3250.0),
                                                                new PriceTier(60, 69, 3600.0),
                                                                new PriceTier(70, 79, 4200.0),
                                                                new PriceTier(80, 89, 4800.0),
                                                                new PriceTier(90, 99, 5400.0),
                                                                new PriceTier(100, 149, 5500.0),
                                                                new PriceTier(150, 199, 8250.0),
                                                                new PriceTier(200, 999, 11000.0)));
                                                p.setQuarterPriceTiers(qt);
                                                productRepo.save(p);
                                                System.out.println(
                                                                "✅ Bowl 1/4 quarterPriceTiers migrated for: "
                                                                                + p.getName());
                                        });

                        // ── MIGRATION: Populate priceTiers for Elotes Revolcados (same as Elote en
                        // Vaso) ──
                        productRepo.findAll().stream()
                                        .filter(p -> p.getName().toLowerCase().contains("elotes revolcados")
                                                        || p.getName().toLowerCase().contains("elote revolcado"))
                                        .filter(p -> p.getPriceTiers() == null
                                                        || p.getPriceTiers().isEmpty())
                                        .forEach(p -> {
                                                List<PriceTier> tiers = new ArrayList<>(List.of(
                                                                new PriceTier(30, 39, 1500.0),
                                                                new PriceTier(40, 49, 2000.0),
                                                                new PriceTier(50, 59, 2500.0),
                                                                new PriceTier(60, 69, 2820.0),
                                                                new PriceTier(70, 79, 3290.0),
                                                                new PriceTier(80, 89, 3760.0),
                                                                new PriceTier(90, 99, 4230.0),
                                                                new PriceTier(100, 109, 4500.0),
                                                                new PriceTier(110, 119, 4950.0),
                                                                new PriceTier(120, 129, 5400.0),
                                                                new PriceTier(130, 139, 5850.0),
                                                                new PriceTier(140, 149, 6300.0),
                                                                new PriceTier(150, 159, 6750.0),
                                                                new PriceTier(160, 169, 7200.0),
                                                                new PriceTier(170, 179, 7650.0),
                                                                new PriceTier(180, 189, 8100.0),
                                                                new PriceTier(190, 199, 8550.0),
                                                                new PriceTier(200, 999, 9000.0)));
                                                tiers.forEach(pt -> pt.setProduct(p));
                                                p.setPriceTiers(tiers);
                                                productRepo.save(p);
                                                System.out.println(
                                                                "✅ priceTiers migrated for: "
                                                                                + p.getName());
                                        });

                        // ── MIGRATION: Restore priceTiers for Elote en Vaso if missing ──
                        productRepo.findAll().stream()
                                        .filter(p -> p.getName().equalsIgnoreCase("Elote en Vaso"))
                                        .filter(p -> p.getPriceTiers() == null
                                                        || p.getPriceTiers().isEmpty())
                                        .forEach(p -> {
                                                List<PriceTier> tiers = new ArrayList<>(List.of(
                                                                new PriceTier(30, 39, 1500.0),
                                                                new PriceTier(40, 49, 2000.0),
                                                                new PriceTier(50, 59, 2500.0),
                                                                new PriceTier(60, 69, 2820.0),
                                                                new PriceTier(70, 79, 3290.0),
                                                                new PriceTier(80, 89, 3760.0),
                                                                new PriceTier(90, 99, 4230.0),
                                                                new PriceTier(100, 109, 4500.0),
                                                                new PriceTier(110, 119, 4950.0),
                                                                new PriceTier(120, 129, 5400.0),
                                                                new PriceTier(130, 139, 5850.0),
                                                                new PriceTier(140, 149, 6300.0),
                                                                new PriceTier(150, 159, 6750.0),
                                                                new PriceTier(160, 169, 7200.0),
                                                                new PriceTier(170, 179, 7650.0),
                                                                new PriceTier(180, 189, 8100.0),
                                                                new PriceTier(190, 199, 8550.0),
                                                                new PriceTier(200, 999, 9000.0)));
                                                tiers.forEach(pt -> pt.setProduct(p));
                                                p.setPriceTiers(tiers);
                                                productRepo.save(p);
                                                System.out.println(
                                                                "✅ priceTiers restored for: "
                                                                                + p.getName());
                                        });
                };
        }
}
