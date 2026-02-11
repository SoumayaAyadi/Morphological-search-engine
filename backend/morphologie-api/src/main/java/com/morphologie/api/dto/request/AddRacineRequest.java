package com.morphologie.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// ============= Add Racine Request =============
public class AddRacineRequest {
    
    @NotBlank(message = "Racine cannot be empty")
    @Size(min = 3, max = 3, message = "Racine must be exactly 3 letters")
    private String racine;
    
    public AddRacineRequest() {}
    
    public AddRacineRequest(String racine) {
        this.racine = racine;
    }
    
    public String getRacine() {
        return racine;
    }
    
    public void setRacine(String racine) {
        this.racine = racine;
    }
}