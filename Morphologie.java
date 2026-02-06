import java.util.ArrayList;
import java.util.List;

public class Morphologie {
    public AVLTree arbre;
    private List<Scheme> schemes;

    public Morphologie() {
        arbre = new AVLTree();
        schemes = new ArrayList<>();
        initSchemes();
    }

    private void initSchemes() {
        schemes.add(new Scheme("Fa3ala", "_1َ_2َ_3َ"));      // كتب -> كَتَبَ
        schemes.add(new Scheme("Maf3oul", "م_1_2و_3"));     // كتب -> مكتوب
        schemes.add(new Scheme("Fa3il", "_1ا_2ِ_3"));       // كتب -> كاتب
    }

    public void generer(String racine, String nomScheme) {
        Node node = arbre.rechercher(racine);
        if (node == null) {
            System.out.println("❌ Racine non trouvée : " + racine);
            return;
        }

        for (Scheme s : schemes) {
            if (s.nom.equalsIgnoreCase(nomScheme)) {
                String mot = s.generate(racine);
                System.out.println("✅ Mot généré : " + mot);
                node.ajouterDerive(mot);
                return;
            }
        }
        System.out.println("❌ Schème introuvable : " + nomScheme);
    }

    public void afficherSchemes() {
        System.out.println("\n=== SCHÈMES DISPONIBLES ===");
        for (Scheme s : schemes) {
            System.out.println("- " + s.nom + " : " + s.pattern);
        }
    }
}