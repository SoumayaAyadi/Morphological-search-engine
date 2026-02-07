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

    // Ajouter mot seul 
    public void ajouterDerive(String mot) {
        if (!derives.contains(mot)) {
            derives.add(mot);
            deriveSchemes.add(""); // schème vide
        }
    }

    // Ajouter mot + schème
    public void ajouterDerive(String mot, String scheme) {
        if (!derives.contains(mot)) {
            derives.add(mot);
            deriveSchemes.add(scheme);
        }
    }

    // Affichage amélioré
    public void afficher() {
        System.out.println("Racine : " + RTLFormatter.rtl(racine));
        if (!derives.isEmpty()) {
            System.out.println("  Dérivés :");
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