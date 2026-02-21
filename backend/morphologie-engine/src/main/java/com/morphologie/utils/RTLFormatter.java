package com.morphologie.utils;

public class RTLFormatter {
    
    /**
     * Inverse l'ordre des caractères d'une chaîne pour l'affichage RTL dans le terminal
     * Cela n'affecte que l'affichage - la chaîne reste inchangée en mémoire
     * 
     * Utile pour l'arabe car le terminal affiche les caractères de gauche à droite
     * alors que l'arabe se lit de droite à gauche
     */
    public static String rtl(String text) {
        // Si le texte est vide ou null, on le retourne tel quel
        if (text == null || text.isEmpty()) {
            return text;
        }
        // On inverse l'ordre des caractères pour un meilleur affichage
        // Exemple: "كاتب" devient "باتك" dans le terminal, mais ça s'affichera correctement
        return new StringBuilder(text).reverse().toString();
    }
}