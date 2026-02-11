package com.morphologie.engine;
import com.morphologie.utils.RTLFormatter;
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
        schemes.put("فَعَلَ", new Scheme("فَعَلَ",
                (c1, c2, c3) -> c1 + "َ" + c2 + "َ" + c3 + "َ"));

        // NORMAL : فاعل
        schemes.put("فاعل", new Scheme("فاعل",
                (c1, c2, c3) -> c1 + "ا" + c2 + "ِ" + c3));

        // NORMAL : مفعول
        schemes.put("مفعول", new Scheme("مفعول",
                (c1, c2, c3) -> "م" + c1 + c2 + "و" + c3));

        // NORMAL : فاعلة
        schemes.put("فاعلة", new Scheme("فاعلة",
                (c1, c2, c3) -> c1 + "ا" + c2 + "ِ" + c3 + "ة"));

        // MAZID : radical répété
        schemes.put("فعّل", new Scheme("فعّل",
            (c1, c2, c3) -> c1 + c2 + "ّ" + c3 + "َ"
        ));

        // MAZID : افعل
        schemes.put("افعل", new Scheme("افعل",
                (c1, c2, c3) -> "ا" + c1 + c2 + c3));

        // MAZID : انفعل
        schemes.put("انفعل", new Scheme("انفعل",
                (c1, c2, c3) -> "ان" + c1 + c2 + c3));

        // MAZID : تفعّل
        schemes.put("تفعّل", new Scheme("تفعّل",
                (c1, c2, c3) -> "ت" + c1 + c2 + "ّ" + c3 + "َ"));

        // MAZID : استفعل
        schemes.put("استفعل", new Scheme("استفعل",
                (c1, c2, c3) -> "است" + c1 + c2 + c3));

        // MAZID : مفعّل
        schemes.put("مفعّل", new Scheme("مفعّل",
                (c1, c2, c3) -> "م" + c1 + c2 + "ّ" + c3 + "َ"));

        // MAZID : فعول
        schemes.put("فعول", new Scheme("فعول",
                (c1, c2, c3) -> "م" + c1 + c2 + "و" + c3));
    }

    // ================= Génération =================
    public void generer(String racine, String nomScheme) {
        Node node = arbre.rechercher(racine);
        if (node == null) {
            System.out.println("❌ Racine non trouvée : " + RTLFormatter.rtl(racine));
            return;
        }

        Scheme s = schemes.get(nomScheme);
        if (s == null) {
            System.out.println("❌ Schème introuvable : " + RTLFormatter.rtl(nomScheme));
            return;
        }

        String mot = s.generate(racine);
        if (mot == null) {
            System.out.println("❌ Génération impossible");
            return;
        }

        // Affichage clair avec racine et schème
        System.out.println("✅ Mot généré : " + RTLFormatter.rtl(mot) + " | Racine : " + RTLFormatter.rtl(racine) + " | Schème : " + RTLFormatter.rtl(s.nom));
        node.ajouterDerive(mot);
    }

    // ================= Affichage =================
    public void afficherSchemes() {
        System.out.println("\n=== SCHÈMES DISPONIBLES ===");
        for (Scheme s : schemes.values()) {
            String typeInfo = s.isDynamic ? " (dynamique)" : " (explicite)";
            System.out.println("- " + RTLFormatter.rtl(s.nom) + typeInfo);
        }
    }

    // ================= Modification / Suppression =================
    public void modifierScheme(String nom, String nouveauPattern) {
        Scheme oldScheme = schemes.get(nom);
        if (oldScheme == null) {
            System.out.println("❌ Schème introuvable : " + RTLFormatter.rtl(nom));
            return;
        }
        
        // Validation : doit contenir ف ع ل
        if (!nouveauPattern.contains("ف") || !nouveauPattern.contains("ع") || !nouveauPattern.contains("ل")) {
            System.out.println("❌ Le nouveau schème doit contenir les lettres ف ع ل !");
            return;
        }
        
        // Créer un nouveau schème dynamique avec le nouveau pattern
        Scheme newScheme = new Scheme(nouveauPattern);
        schemes.remove(nom);
        schemes.put(nouveauPattern, newScheme);
        System.out.println("✅ Schème modifié : " + RTLFormatter.rtl(nom) + " → " + RTLFormatter.rtl(nouveauPattern));
    }

    public void supprimerScheme(String nom) {
        if (schemes.remove(nom) != null) {
            System.out.println("✅ Schème supprimé : " + RTLFormatter.rtl(nom));
        } else {
            System.out.println("❌ Schème introuvable : " + RTLFormatter.rtl(nom));
        }
    }

    // ================= Validation morphologique =================
    public void validerMot(String racine, String mot) {
        Node node = arbre.rechercher(racine);
        if (node == null) {
            System.out.println("❌ Racine non trouvée : " + RTLFormatter.rtl(racine));
            return;
        }

        for (Scheme s : schemes.values()) {
            if (mot.equals(s.generate(racine))) {
                System.out.println("✅ Le mot " + RTLFormatter.rtl(mot) + " appartient morphologiquement à la racine " + RTLFormatter.rtl(racine) + " | Schème : " + RTLFormatter.rtl(s.nom));
                node.ajouterDerive(mot);
                return;
            }
        }

        System.out.println("❌ Le mot " + RTLFormatter.rtl(mot) + " n'appartient pas morphologiquement à la racine " + RTLFormatter.rtl(racine));
    }

    // ================= Analyse inversée =================
    public void analyserMot(String mot) {
        for (Node node : arbre.getAllNodes()) {
            for (Scheme s : schemes.values()) {
                if (mot.equals(s.generate(node.racine))) {
                    System.out.println("✅ Analyse réussie :");
                    System.out.println("   Mot    : " + RTLFormatter.rtl(mot));
                    System.out.println("   Racine : " + RTLFormatter.rtl(node.racine));
                    System.out.println("   Schème : " + RTLFormatter.rtl(s.nom));
                    return;
                }
            }
        }
        System.out.println("❌ Mot inconnu : " + RTLFormatter.rtl(mot));
    }

    // ================= Ajout d'un nouveau schème (DYNAMIQUE) =================
    public void ajouterScheme(String nom) {
        // Validation 1 : Non null et non vide
        if (nom == null || nom.trim().isEmpty()) {
            System.out.println("❌ Le schème ne peut pas être vide !");
            return;
        }
        
        // Validation 2 : Doit contenir ف ع ل
        if (!nom.contains("ف") || !nom.contains("ع") || !nom.contains("ل")) {
            System.out.println("❌ Le schème doit contenir les lettres ف ع ل !");
            return;
        }
        
        // Validation 3 : Ne doit pas déjà exister
        if (schemes.containsKey(nom)) {
            System.out.println("❌ Ce schème existe déjà !");
            return;
        }
        
        schemes.put(nom, new Scheme(nom));
        System.out.println("✅ Schème ajouté : " + RTLFormatter.rtl(nom));
    }
    
    // ================= Ajout avec règle explicite (pour compatibilité) =================
    public void ajouterScheme(String nom, Scheme.Transformation rule) {
        if (schemes.containsKey(nom)) {
            System.out.println("❌ Ce schème existe déjà !");
            return;
        }
        schemes.put(nom, new Scheme(nom, rule));
        System.out.println("✅ Schème ajouté : " + RTLFormatter.rtl(nom));
    }
    
    // ================= Affichage des dérivés d'une racine =================
    public void afficherDerivesRacine(String racine) {
        Node node = arbre.rechercher(racine);
        if (node == null) {
            System.out.println("❌ Racine non trouvée : " + RTLFormatter.rtl(racine));
            return;
        }

        System.out.println("=== Dérivés de la racine " + RTLFormatter.rtl(racine) + " ===");
        if (node.derives.isEmpty()) {
            System.out.println("❌ Aucun mot dérivé pour cette racine");
        } else {
            for (String mot : node.derives) {
                System.out.println("- " + RTLFormatter.rtl(mot));
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
    
    /**
     * Get a scheme by name
     */
    public Scheme getScheme(String schemeName) {
        return schemes.get(schemeName);
    }
}