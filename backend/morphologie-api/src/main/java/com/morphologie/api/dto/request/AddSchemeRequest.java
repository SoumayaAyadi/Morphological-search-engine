package com.morphologie.api.dto.request;

import jakarta.validation.constraints.NotBlank;

// ============= Add Scheme Request =============

public class AddSchemeRequest {
    
    @NotBlank(message = "Scheme name cannot be empty")
    private String nom;
    
    private String type = "CUSTOM";  // NORMAL, MAZID, CUSTOM
    private String description;
    
    public AddSchemeRequest() {}
    
    public String getNom() {
        return nom;
    }
    
    public void setNom(String nom) {
        this.nom = nom;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
