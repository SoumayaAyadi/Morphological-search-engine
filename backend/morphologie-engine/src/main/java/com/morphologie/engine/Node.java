package com.morphologie.engine;

import com.morphologie.utils.RTLFormatter;
import java.util.ArrayList;
import java.util.List;

public class Node {
    String racine;           // Le mot racine (en arabe)
    Node gauche;             // Sous-arbre gauche (mots plus petits)
    Node droite;             // Sous-arbre droit (mots plus grands)
    int height;              // Hauteur du nœud pour l'équilibrage AVL
    List<String> derives;    // Liste des mots générés à partir de cette racine
    List<String> deriveSchemes; // Schème correspondant à chaque mot généré

    // Constructeur : crée un nouveau nœud avec une racine
    public Node(String racine) {
        this.racine = racine;
        this.gauche = null;
        this.droite = null;
        this.height = 1;           // Hauteur initiale = 1 (feuille)
        this.derives = new ArrayList<>();
        this.deriveSchemes = new ArrayList<>();
    }

    // Ajoute un mot dérivé sans préciser le schème
    public void ajouterDerive(String mot) {
        if (!derives.contains(mot)) {           // On évite les doublons
            derives.add(mot);
            deriveSchemes.add("");               // Pas de schème associé
        }
    }

    // Ajoute un mot dérivé avec son schème
    public void ajouterDerive(String mot, String scheme) {
        if (!derives.contains(mot)) {           // On évite les doublons
            derives.add(mot);
            deriveSchemes.add(scheme);           // On garde le schème correspondant
        }
    }

    // Affiche la racine et tous ses dérivés
    public void afficher() {
        System.out.println("Racine : " + RTLFormatter.rtl(racine));
        if (!derives.isEmpty()) {
            System.out.println("  Dérivés :");
            // On parcourt tous les dérivés avec leurs schèmes
            for (int i = 0; i < derives.size(); i++) {
                String mot = derives.get(i);
                String scheme = deriveSchemes.get(i);
                System.out.println("    - " + RTLFormatter.rtl(mot) + " | Schème : " + RTLFormatter.rtl(scheme));
            }
        } else {
            System.out.println("  Aucun dérivé");
        }
        System.out.println();
    }
}