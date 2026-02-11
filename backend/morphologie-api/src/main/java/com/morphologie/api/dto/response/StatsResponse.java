package com.morphologie.api.dto.response;

import java.util.List;


// ============= Statistics Response =============
public class StatsResponse {
    
    private long totalRacines;
    private long totalSchemes;
    private long totalDerivations;
    private List<SchemeUsage> popularSchemes;
    
    public StatsResponse() {}
    
    public long getTotalRacines() {
        return totalRacines;
    }
    
    public void setTotalRacines(long totalRacines) {
        this.totalRacines = totalRacines;
    }
    
    public long getTotalSchemes() {
        return totalSchemes;
    }
    
    public void setTotalSchemes(long totalSchemes) {
        this.totalSchemes = totalSchemes;
    }
    
    public long getTotalDerivations() {
        return totalDerivations;
    }
    
    public void setTotalDerivations(long totalDerivations) {
        this.totalDerivations = totalDerivations;
    }
    
    public List<SchemeUsage> getPopularSchemes() {
        return popularSchemes;
    }
    
    public void setPopularSchemes(List<SchemeUsage> popularSchemes) {
        this.popularSchemes = popularSchemes;
    }
    
    // Inner class for scheme usage
    public static class SchemeUsage {
        private String scheme;
        private int usageCount;
        
        public SchemeUsage() {}
        
        public SchemeUsage(String scheme, int usageCount) {
            this.scheme = scheme;
            this.usageCount = usageCount;
        }
        
        public String getScheme() {
            return scheme;
        }
        
        public void setScheme(String scheme) {
            this.scheme = scheme;
        }
        
        public int getUsageCount() {
            return usageCount;
        }
        
        public void setUsageCount(int usageCount) {
            this.usageCount = usageCount;
        }
    }
}