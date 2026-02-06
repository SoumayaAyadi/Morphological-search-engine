import java.util.ArrayList;
import java.util.List;

public class Node {
    String racine;
    Node gauche;
    Node droite;
    int height;
    List<String> derives;

    public Node(String racine) {
        this.racine = racine;
        this.gauche = null;
        this.droite = null;
        this.height = 1;
        this.derives = new ArrayList<>();
    }

    public void ajouterDerive(String mot) {
        if (!derives.contains(mot)) {
            derives.add(mot);
        }
    }

    public void afficher() {
        System.out.println("Racine : " + racine);
        if (!derives.isEmpty()) {
            System.out.println("  Dérivés :");
            for (String d : derives) {
                System.out.println("    - " + d);
            }
        } else {
            System.out.println("  Aucun dérivé");
        }
        System.out.println();
    }
}