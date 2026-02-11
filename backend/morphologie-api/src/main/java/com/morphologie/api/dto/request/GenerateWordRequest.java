package com.morphologie.api.dto.request;

import jakarta.validation.constraints.NotBlank;


// ============= Generate Word Request =============
public class GenerateWordRequest {
    
    @NotBlank(message = "Racine cannot be empty")
    private String racine;
    
    @NotBlank(message = "Scheme cannot be empty")
    private String scheme;
    
    public GenerateWordRequest() {}
    
    public GenerateWordRequest(String racine, String scheme) {
        this.racine = racine;
        this.scheme = scheme;
    }
    
    public String getRacine() {
        return racine;
    }
    
    public void setRacine(String racine) {
        this.racine = racine;
    }
    
    public String getScheme() {
        return scheme;
    }
    
    public void setScheme(String scheme) {
        this.scheme = scheme;
    }
}
