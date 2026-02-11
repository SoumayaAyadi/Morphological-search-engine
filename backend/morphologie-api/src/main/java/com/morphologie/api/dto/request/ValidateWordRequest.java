package com.morphologie.api.dto.request;

import jakarta.validation.constraints.NotBlank;

// ============= Validate Word Request =============
public class ValidateWordRequest {
    
    @NotBlank(message = "Racine cannot be empty")
    private String racine;
    
    @NotBlank(message = "Mot cannot be empty")
    private String mot;
    
    public ValidateWordRequest() {}
    
    public ValidateWordRequest(String racine, String mot) {
        this.racine = racine;
        this.mot = mot;
    }
    
    public String getRacine() {
        return racine;
    }
    
    public void setRacine(String racine) {
        this.racine = racine;
    }
    
    public String getMot() {
        return mot;
    }
    
    public void setMot(String mot) {
        this.mot = mot;
    }
}
