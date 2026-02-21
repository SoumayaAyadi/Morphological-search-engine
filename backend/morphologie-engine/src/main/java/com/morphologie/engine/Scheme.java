// Scheme.java
package com.morphologie.engine;

public class Scheme {

    String nom;    // nom du schème 
    Transformation rule; // fonction qui applique la règle de transformation
    boolean isDynamic; // vrai si le schème a été généré à partir d'un pattern

    // Interface fonctionnelle pour appliquer la règle
    // Prend les 3 lettres de la racine et retourne le mot généré
    public interface Transformation {
        String apply(String c1, String c2, String c3);
    }

    // Constructeur avec règle explicite (pour les schèmes pré-définis)
    public Scheme(String nom, Transformation rule) {
        this.nom = nom;
        this.rule = rule;
        this.isDynamic = false;
    }

    // Constructeur dynamique : le nom du schème EST le pattern
    // Exemple: "فاعل" va générer automatiquement la règle
    public Scheme(String nom) {
        this.nom = nom;
        this.rule = createRuleFromPattern(nom);
        this.isDynamic = true;
    }

    // Génère une règle de transformation à partir d'un pattern
    // Le pattern utilise ف ع ل comme placeholders pour les lettres de la racine
    // Exemple: "فاعل" -> c1 + "ا" + c2 + "ل"
    private Transformation createRuleFromPattern(String pattern) {
        return (c1, c2, c3) -> {
            StringBuilder result = new StringBuilder();
            
            // On parcourt chaque caractère du pattern
            for (int i = 0; i < pattern.length(); i++) {
                char ch = pattern.charAt(i);
                
                // Si on trouve une lettre placeholder, on la remplace
                if (ch == 'ف') {
                    result.append(c1);  // Remplace ف par la 1ère lettre
                } else if (ch == 'ع') {
                    result.append(c2);  // Remplace ع par la 2ème lettre
                } else if (ch == 'ل') {
                    result.append(c3);  // Remplace ل par la 3ème lettre
                } else {
                    result.append(ch);  // Garde les autres caractères (voyelles, préfixes...)
                }
            }
            
            return result.toString();
        };
    }

    // Génère un mot à partir d'une racine de 3 lettres
    public String generate(String racine) {
        if (racine == null || racine.length() != 3) return null;

        // On extrait les 3 lettres de la racine
        String c1 = "" + racine.charAt(0);
        String c2 = "" + racine.charAt(1);
        String c3 = "" + racine.charAt(2);

        if (rule != null) {
            return rule.apply(c1, c2, c3);  // On applique la règle
        }

        return null;
    }
}