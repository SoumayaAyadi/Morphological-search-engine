package com.morphologie.api.dto.response;



// ============= Validation Response =============
public class ValidationResponse {
    
    private boolean valid;
    private String racine;
    private String mot;
    private String scheme;
    
    public ValidationResponse() {}
    
    public ValidationResponse(boolean valid, String racine, String mot, String scheme) {
        this.valid = valid;
        this.racine = racine;
        this.mot = mot;
        this.scheme = scheme;
    }
    
    public boolean isValid() {
        return valid;
    }
    
    public void setValid(boolean valid) {
        this.valid = valid;
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
    
    public String getScheme() {
        return scheme;
    }
    
    public void setScheme(String scheme) {
        this.scheme = scheme;
    }
}
