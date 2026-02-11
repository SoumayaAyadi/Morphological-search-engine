package com.morphologie.api.dto.response;



// ============= Generated Word Response =============
public class GeneratedWordResponse {
    
    private String motGenere;
    private String racine;
    private String scheme;
    
    public GeneratedWordResponse() {}
    
    public GeneratedWordResponse(String motGenere, String racine, String scheme) {
        this.motGenere = motGenere;
        this.racine = racine;
        this.scheme = scheme;
    }
    
    public String getMotGenere() {
        return motGenere;
    }
    
    public void setMotGenere(String motGenere) {
        this.motGenere = motGenere;
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
