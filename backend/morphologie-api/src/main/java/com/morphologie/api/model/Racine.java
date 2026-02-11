package com.morphologie.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "racines")
public class Racine {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String racine;  // 3-letter root
    
    private List<Derivation> derives;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public Racine() {
        this.derives = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Racine(String racine) {
        this();
        this.racine = racine;
    }
    
    // Add derived word
    public void addDerive(String mot, String scheme) {
        if (derives == null) {
            derives = new ArrayList<>();
        }
        
        // Check if already exists
        for (Derivation d : derives) {
            if (d.getMot().equals(mot)) {
                return; // Already exists
            }
        }
        
        derives.add(new Derivation(mot, scheme));
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRacine() {
        return racine;
    }

    public void setRacine(String racine) {
        this.racine = racine;
    }

    public List<Derivation> getDerives() {
        return derives;
    }

    public void setDerives(List<Derivation> derives) {
        this.derives = derives;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}