package com.medialuna.snackbar.controller;

import com.medialuna.snackbar.model.Product;
import com.medialuna.snackbar.repository.ProductRepository;
import com.medialuna.snackbar.service.GroqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.io.File;
import java.nio.file.Files;

@RestController
public class DebugPromptController {

    @Autowired
    private GroqService groqService;

    @Autowired
    private ProductRepository productRepo;

    @GetMapping("/debug/prompt")
    public String dumpPrompt() {
        try {
            List<Product> products = productRepo.findAll();
            ObjectMapper mapper = new ObjectMapper();

            // Convert to List<Map<String,Object>> as GroqService expects
            List<Map<String, Object>> productsList = new ArrayList<>();
            for (Product p : products) {
                Map<String, Object> map = new HashMap<>();
                map.put("name", p.getName());
                map.put("category", p.getCategory());
                map.put("price", p.getPrice());
                map.put("rentalPricePerDay", p.getRentalPricePerDay());

                if (p.getPriceTiers() != null && !p.getPriceTiers().isEmpty()) {
                    List<Map<String, Object>> ptList = new ArrayList<>();
                    for (var pt : p.getPriceTiers()) {
                        Map<String, Object> ptMap = new HashMap<>();
                        ptMap.put("minGuests", pt.getMinGuests());
                        ptMap.put("maxGuests", pt.getMaxGuests());
                        ptMap.put("price", pt.getPrice());
                        ptList.add(ptMap);
                    }
                    map.put("priceTiers", ptList);
                }
                if (p.getQuarterPriceTiers() != null && !p.getQuarterPriceTiers().isEmpty()) {
                    List<Map<String, Object>> qtList = new ArrayList<>();
                    for (var qt : p.getQuarterPriceTiers()) {
                        Map<String, Object> qtMap = new HashMap<>();
                        qtMap.put("minGuests", qt.getMinGuests());
                        qtMap.put("maxGuests", qt.getMaxGuests());
                        qtMap.put("price", qt.getPrice());
                        qtList.add(qtMap);
                    }
                    map.put("quarterPriceTiers", qtList);
                }
                productsList.add(map);
            }

            Map<String, Object> ctx = new HashMap<>();
            ctx.put("products", productsList);

            String prompt = groqService.buildSystemPrompt(ctx);
            Files.writeString(new File("/tmp/prompt_dump.txt").toPath(), prompt);
            return "Prompt written to /tmp/prompt_dump.txt";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
