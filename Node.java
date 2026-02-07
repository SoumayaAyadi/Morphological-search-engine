import java.util.ArrayList;
import java.util.List;

public class Node {
    String racine;
    Node gauche;
    Node droite;
    int height;
    List<String> derives;       // liste des mots générés
    List<String> deriveSchemes; // schème correspondant à chaque mot

    public Node(String racine) {
        this.racine = racine;
        this.gauche = null;
        this.droite = null;
        this.height = 1;
        this.derives = new ArrayList<>();
        this.deriveSchemes = new ArrayList<>();
    }

    // Ajouter mot seul (ancienne version)
    public void ajouterDerive(String mot) {
        if (!derives.contains(mot)) {
            derives.add(mot);
            deriveSchemes.add(""); // schème vide
        }
    }

    // Nouvelle version : mot + schème
    public void ajouterDerive(String mot, String scheme) {
        if (!derives.contains(mot)) {
            derives.add(mot);
            deriveSchemes.add(scheme);
        }
    }

    // Affichage amélioré
    public void afficher() {
        System.out.println("Racine : " + racine);
        if (!derives.isEmpty()) {
            System.out.println("  Dérivés :");
            for (int i = 0; i < derives.size(); i++) {
                String mot = derives.get(i);
                String scheme = deriveSchemes.get(i);
                System.out.println("    - " + mot + " | Schème : " + scheme);
            }
        } else {
            System.out.println("  Aucun dérivé");
        }
        System.out.println();
    }
}