package com.morphologie.api.dto.request;

import jakarta.validation.constraints.NotBlank;


// ============= Analyze Word Request =============
public class AnalyzeWordRequest {
    
    @NotBlank(message = "Mot cannot be empty")
    private String mot;
    
    public AnalyzeWordRequest() {}
    
    public AnalyzeWordRequest(String mot) {
        this.mot = mot;
    }
    
    public String getMot() {
        return mot;
    }
    
    public void setMot(String mot) {
        this.mot = mot;
    }
}
