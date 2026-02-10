// Scheme.java
package com.morphologie.engine;

public class Scheme {

    String nom;    // nom du schème
    Transformation rule; // fonction qui applique la règle
    boolean isDynamic; // vrai si généré dynamiquement

    // Interface fonctionnelle pour appliquer la règle
    public interface Transformation {
        String apply(String c1, String c2, String c3);
    }

    // Constructeur avec règle explicite (pour les schèmes existants)
    public Scheme(String nom, Transformation rule) {
        this.nom = nom;
        this.rule = rule;
        this.isDynamic = false;
    }

    // Constructeur dynamique (le nom du schème EST le pattern)
    public Scheme(String nom) {
        this.nom = nom;
        this.rule = createRuleFromPattern(nom);
        this.isDynamic = true;
    }

    // Génère une règle de transformation à partir d'un pattern
    // Le pattern utilise ف ع ل comme placeholders
    private Transformation createRuleFromPattern(String pattern) {
        return (c1, c2, c3) -> {
            StringBuilder result = new StringBuilder();
            
            // Parcourir chaque caractère du pattern
            for (int i = 0; i < pattern.length(); i++) {
                char ch = pattern.charAt(i);
                
                if (ch == 'ف') {
                    result.append(c1);
                } else if (ch == 'ع') {
                    result.append(c2);
                } else if (ch == 'ل') {
                    result.append(c3);
                } else {
                    result.append(ch);
                }
            }
            
            return result.toString();
        };
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