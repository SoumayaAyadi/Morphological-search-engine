// Scheme.java
package com.morphologie.engine;


public class Scheme {

    String nom;    // nom du schème
    String type;   // NORMAL / NAQIS / MAZID
    Transformation rule; // fonction qui applique la règle

    // Interface fonctionnelle pour appliquer la règle
    public interface Transformation {
        String apply(String c1, String c2, String c3);
    }

    public Scheme(String nom, String type, Transformation rule) {
        this.nom = nom;
        this.type = type;
        this.rule = rule;
    }

    public String generate(String racine) {
        if (racine == null || racine.length() != 3) return null;

        String c1 = "" + racine.charAt(0);
        String c2 = "" + racine.charAt(1);
        String c3 = "" + racine.charAt(2);

        if (rule != null) {
            return rule.apply(c1, c2, c3);
        }

        return null;
    }
}