package com.morphologie.api.dto.response;

import java.time.LocalDateTime;
import java.util.List;

// ============= Racine With Derives Response =============
public class RacineWithDerivesResponse {
    
    private String racine;
    private List<DeriveInfo> derives;
    private int totalDerives;
    
    public RacineWithDerivesResponse() {}
    
    public String getRacine() {
        return racine;
    }
    
    public void setRacine(String racine) {
        this.racine = racine;
    }
    
    public List<DeriveInfo> getDerives() {
        return derives;
    }
    
    public void setDerives(List<DeriveInfo> derives) {
        this.derives = derives;
    }
    
    public int getTotalDerives() {
        return totalDerives;
    }
    
    public void setTotalDerives(int totalDerives) {
        this.totalDerives = totalDerives;
    }
    
    // Inner class for derive info
    public static class DeriveInfo {
        private String mot;
        private String scheme;
        private LocalDateTime createdAt;
        
        public DeriveInfo() {}
        
        public DeriveInfo(String mot, String scheme, LocalDateTime createdAt) {
            this.mot = mot;
            this.scheme = scheme;
            this.createdAt = createdAt;
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
        
        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
        
        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}
