package com.morphologie.api.dto.response;



// ============= Analysis Response =============
public class AnalysisResponse {
    
    private String mot;
    private String racine;
    private String scheme;
    private boolean found;
    
    public AnalysisResponse() {}
    
    public AnalysisResponse(String mot, String racine, String scheme, boolean found) {
        this.mot = mot;
        this.racine = racine;
        this.scheme = scheme;
        this.found = found;
    }
    
    public String getMot() {
        return mot;
    }
    
    public void setMot(String mot) {
        this.mot = mot;
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
    
    public boolean isFound() {
        return found;
    }
    
    public void setFound(boolean found) {
        this.found = found;
    }
}