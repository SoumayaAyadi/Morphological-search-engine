package com.morphologie.engine;

import java.util.HashMap; 
 
public class HashTable { 
    private HashMap<String, String> schemes;  // Table qui stocke les patterns morphologiques
 
    // Constructeur - crée une nouvelle table vide
    public HashTable() { 
        schemes = new HashMap<>(); 
    } 
 
    // Ajoute ou modifie un pattern dans la table
    // nom : le nom du pattern (ex: "masculin_pluriel")
    // pattern : la règle de transformation (ex: "ajoute 's' à la fin")
    public void addScheme(String nom, String pattern) { 
        schemes.put(nom, pattern); 
    } 
 
    // Récupère un pattern à partir de son nom
    // Retourne null si le nom n'existe pas
    public String getScheme(String nom) { 
        return schemes.get(nom); 
    } 
 
    // Affiche tous les patterns stockés dans la table
    public void afficherSchemes() { 
        System.out.println("\n=== PATTERNS ==="); 
        // Parcourt toutes les entrées de la table
        for (String key : schemes.keySet()) { 
            System.out.println(key + " -> " + schemes.get(key)); 
        } 
    } 
}