package com.morphologie.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateRacineRequest {
    
    @NotBlank(message = "Racine is required")
    @Size(min = 3, max = 3, message = "Racine must be exactly 3 characters")
    private String racine;
    
    public String getRacine() {
        return racine;
    }
    
    public void setRacine(String racine) {
        this.racine = racine;
    }
}