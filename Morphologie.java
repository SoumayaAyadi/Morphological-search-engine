import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;

public class Morphologie {

    public AVLTree arbre;
    private HashMap<String, Scheme> schemes; // Table de hachage des schèmes

    public Morphologie() {
        arbre = new AVLTree();
        schemes = new HashMap<>();
        initSchemes();
    }

    // ================= Initialisation des schèmes avec règles explicites =================
    private void initSchemes() {

        // NORMAL : فَعَلَ
        schemes.put("فَعَلَ", new Scheme("فَعَلَ", "NORMAL",
                (c1, c2, c3) -> c1 + "َ" + c2 + "َ" + c3 + "َ"));

        // NORMAL : فاعل
        schemes.put("فاعل", new Scheme("فاعل", "NORMAL",
                (c1, c2, c3) -> c1 + "ا" + c2 + "ِ" + c3));

        // NORMAL : مفعول
        schemes.put("مفعول", new Scheme("مفعول", "NORMAL",
                (c1, c2, c3) -> "م" + c1 + c2 + "و" + c3));

        // NORMAL : فاعلة
        schemes.put("فاعلة", new Scheme("فاعلة", "NORMAL",
                (c1, c2, c3) -> c1 + "ا" + c2 + "ِ" + c3 + "ة"));

        // NE9SA : الفعل الناقص
schemes.put("فعل_ناقص", new Scheme("فعل_ناقص", "NAQIS",
    (c1, c2, c3) -> {
        // Si 3ᵉ radical est و ou ي → on le transforme en ا
        if (c3.equals("و") || c3.equals("ي")) return c1 + "َ" + c2 + "َا";
        return c1 + "َ" + c2 + "َ" + c3;
    }
));

        // MAZID : radical répété
schemes.put("فعّل", new Scheme("فعّل", "MAZID",
    (c1, c2, c3) -> c1 + c2 + "ّ" + c2 + "َ" + c3 + "َ"
));

        // MAZID : افعل
        schemes.put("افعل", new Scheme("افعل", "MAZID",
                (c1, c2, c3) -> "ا" + c1 + c2 + c3));

        // MAZID : انفعل
        schemes.put("انفعل", new Scheme("انفعل", "MAZID",
                (c1, c2, c3) -> "ان" + c1 + c2 + c3));

        // MAZID : تفعّل
        schemes.put("تفعّل", new Scheme("تفعّل", "MAZID",
                (c1, c2, c3) -> "ت" + c1 + c2 + "ّ" + c2 + "َ" + c3 + "َ"));

        // MAZID : استفعل
        schemes.put("استفعل", new Scheme("استفعل", "MAZID",
                (c1, c2, c3) -> "است" + c1 + c2 + c3));

        // MAZID : مفعّل
        schemes.put("مفعّل", new Scheme("مفعّل", "MAZID",
                (c1, c2, c3) -> "م" + c1 + c2 + "ّ" + c2 + "َ" + c3 + "َ"));

        // MAZID : فعول
        schemes.put("فعول", new Scheme("فعول", "MAZID",
                (c1, c2, c3) -> "م" + c1 + c2 + "و" + c3));
    }

    // ================= Génération =================
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
        if (mot == null) {
            System.out.println("❌ Génération impossible");
            return;
        }

        // Affichage clair avec racine et schème
        System.out.println("✅ Mot généré : '" + mot + "' | Racine : '" + racine + "' | Schème : '" + s.nom + "'");
        node.ajouterDerive(mot);
    }

    // ================= Affichage =================
    public void afficherSchemes() {
        System.out.println("\n=== SCHÈMES DISPONIBLES ===");
        for (Scheme s : schemes.values()) {
            System.out.println("- " + s.nom + " | type = " + s.type);
        }
    }

    // ================= Modification / Suppression =================
    public void modifierScheme(String nom, String nouveauPattern) {
        System.out.println("❌ Avec cette approche, modification pattern non autorisée directement !");
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

        for (Scheme s : schemes.values()) {
            if (mot.equals(s.generate(racine))) {
                System.out.println("✅ Le mot '" + mot + "' appartient morphologiquement à la racine '" + racine + "' | Schème : '" + s.nom + "'");
                node.ajouterDerive(mot);
                return;
            }
        }

        System.out.println("❌ Le mot '" + mot + "' n'appartient pas morphologiquement à la racine '" + racine + "'");
    }

    // ================= Analyse inversée =================
    public void analyserMot(String mot) {
        for (Node node : arbre.getAllNodes()) {
            for (Scheme s : schemes.values()) {
                if (mot.equals(s.generate(node.racine))) {
                    System.out.println("✅ Analyse réussie :");
                    System.out.println("   Mot    : '" + mot + "'");
                    System.out.println("   Racine : '" + node.racine + "'");
                    System.out.println("   Schème : '" + s.nom + "'");
                    return;
                }
            }
        }
        System.out.println("❌ Mot inconnu : '" + mot + "'");
    }

    // ================= Ajout d'un nouveau schème =================
    public void ajouterScheme(String nom, String type, Scheme.Transformation rule) {
        if (schemes.containsKey(nom)) {
            System.out.println("❌ Ce schème existe déjà !");
            return;
        }
        schemes.put(nom, new Scheme(nom, type, rule));
        System.out.println("✅ Schème ajouté : " + nom);
    }
     // ================= Affichage des dérivés d'une racine =================//
    public void afficherDerivesRacine(String racine) {
    Node node = arbre.rechercher(racine);
    if (node == null) {
        System.out.println("❌ Racine non trouvée : " + racine);
        return;
    }

    System.out.println("=== Dérivés de la racine '" + racine + "' ===");
    if (node.derives.isEmpty()) {
        System.out.println("❌ Aucun mot dérivé pour cette racine");
    } else {
        for (String mot : node.derives) {
            System.out.println("- " + mot);
        }
    }
}


    // ================= Getters pour menus =================
    public List<String> getAllRacines() {
        List<String> racines = new ArrayList<>();
        for (Node n : arbre.getAllNodes()) {
            racines.add(n.racine);
        }
        return racines;
    }

    public List<String> getAllSchemes() {
        return new ArrayList<>(schemes.keySet());
    }

    
}