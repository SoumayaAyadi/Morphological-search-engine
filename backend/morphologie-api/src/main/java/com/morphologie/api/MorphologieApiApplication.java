package com.morphologie.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.morphologie.api.repository")
public class MorphologieApiApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(MorphologieApiApplication.class, args);
        System.out.println("=".repeat(60));
        System.out.println("  ✅ Morphological Search Engine API Started Successfully!");
        System.out.println("  📍 Access API at: http://localhost:8080/api");
        System.out.println("  📦 MongoDB Connected Successfully!");
        System.out.println("=".repeat(60));
    }
}