import java.util.HashMap;

public class Morphologie {
    public AVLTree arbre;
    private HashMap<String, Scheme> schemes; // HashMap pour accès O(1)

    public Morphologie() {
        arbre = new AVLTree();
        schemes = new HashMap<>();
        initSchemes();
    }

    private void initSchemes() {
        schemes.put("فَعَلَ", new Scheme("فَعَلَ", "_1َ_2َ_3َ"));  // كتب -> كَتَبَ
        schemes.put("مفعول", new Scheme("مفعول", "م_1_2و_3"));     // كتب -> مكتوب
        schemes.put("فاعل", new Scheme("فاعل", "_1ا_2ِ_3"));       // كتب -> كاتب
    }

    // Génération d’un mot à partir d’une racine et d’un schème
    public void generer(String racine, String nomScheme) {
        Node node = arbre.rechercher(racine);
        if (node == null) {
            System.out.println("❌ Racine non trouvée : " + racine);
            return;
        }

        Scheme s = schemes.get(nomScheme);
        if (s == null) {
            System.out.println("❌ Schème introuvable : " + nomScheme);
            return;
        }

        String mot = s.generate(racine);
        System.out.println("✅ Mot généré : " + mot);
        node.ajouterDerive(mot);
    }

    public void afficherSchemes() {
        System.out.println("\n=== SCHÈMES DISPONIBLES ===");
        for (String key : schemes.keySet()) {
            System.out.println("- " + key + " : " + schemes.get(key).pattern);
        }
    }

    public void modifierScheme(String nom, String nouveauPattern) {
        Scheme s = schemes.get(nom);
        if (s != null) {
            s.pattern = nouveauPattern;
            System.out.println("✅ Schème modifié : " + nom);
        } else {
            System.out.println("❌ Schème introuvable : " + nom);
        }
    }

    public void supprimerScheme(String nom) {
        if (schemes.remove(nom) != null) {
            System.out.println("✅ Schème supprimé : " + nom);
        } else {
            System.out.println("❌ Schème introuvable : " + nom);
        }
    }

   // ================= Validation morphologique =================
    public void validerMot(String racine, String mot) {
        Node node = arbre.rechercher(racine);
        if (node == null) {
            System.out.println("❌ Racine non trouvée : " + racine);
            return;
        }

        boolean valide = false;
        String schPattern = "";
        for (Scheme s : schemes.values()) {
            String test = s.generate(racine);
            if (test.equals(mot)) {
                valide = true;
                schPattern = s.nom;
                break;
            }
        }

        if (valide) {
            System.out.println("✅ Mot valide pour la racine " + racine + ", schème : " + schPattern);
            node.ajouterDerive(mot);
        } else {
            System.out.println("❌ Mot NON valide pour la racine " + racine);
        }
    }

    // ================= Analyse inversée (mot -> racine + schème) =================
    public void analyserMot(String mot) {
        for (Node node : arbre.getAllNodes()) {
            for (Scheme s : schemes.values()) {
                if (s.generate(node.racine).equals(mot)) {
                    System.out.println("✅ Mot : " + mot + " appartient à la racine " + node.racine + ", schème : " + s.nom);
                    return;
                }
            }
        }
        System.out.println("❌ Mot : " + mot + " n'appartient à aucune racine connue.");
    }

}