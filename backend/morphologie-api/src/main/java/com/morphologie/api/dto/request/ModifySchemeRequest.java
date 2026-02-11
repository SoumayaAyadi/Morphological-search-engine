package com.morphologie.api.dto.request;

import jakarta.validation.constraints.NotBlank;

// ============= Modify Scheme Request =============
public class ModifySchemeRequest {
    
    @NotBlank(message = "New pattern cannot be empty")
    private String newPattern;
    
    public ModifySchemeRequest() {}
    
    public String getNewPattern() {
        return newPattern;
    }
    
    public void setNewPattern(String newPattern) {
        this.newPattern = newPattern;
    }
}