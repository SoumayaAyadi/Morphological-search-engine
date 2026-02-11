package com.morphologie.api.model;

import java.time.LocalDateTime;

public class Derivation {
    
    private String mot;          // The derived word
    private String scheme;       // The scheme used
    private LocalDateTime createdAt;
    
    // Constructors
    public Derivation() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Derivation(String mot, String scheme) {
        this.mot = mot;
        this.scheme = scheme;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getMot() {
        return mot;
    }

    public void setMot(String mot) {
        this.mot = mot;
    }

    public String getScheme() {
        return scheme;
    }

    public void setScheme(String scheme) {
        this.scheme = scheme;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}