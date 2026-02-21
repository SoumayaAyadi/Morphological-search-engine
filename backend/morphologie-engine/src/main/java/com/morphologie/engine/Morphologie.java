package com.morphologie.engine;
import com.morphologie.utils.RTLFormatter;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;

public class Morphologie {

    public AVLTree arbre;  // L'arbre qui contient toutes les racines
    private HashMap<String, Scheme> schemes; // Table qui stocke les schèmes (patterns de dérivation)

    // Constructeur : initialise l'arbre et la table des schèmes
    public Morphologie() {
        arbre = new AVLTree();
        schemes = new HashMap<>();
        initSchemes();  // On charge les schèmes de base
    }

    // ================= Initialisation des schèmes avec règles explicites =================
    // Cette méthode crée tous les schèmes de base du système
    private void initSchemes() {

        // NORMAL : فَعَلَ (forme de base du verbe)
        schemes.put("فَعَلَ", new Scheme("فَعَلَ",
                (c1, c2, c3) -> c1 + "َ" + c2 + "َ" + c3 + "َ"));

        // NORMAL : فاعل (nom d'agent)
        schemes.put("فاعل", new Scheme("فاعل",
                (c1, c2, c3) -> c1 + "ا" + c2 + "ِ" + c3));

        // NORMAL : مفعول (nom d'objet)
        schemes.put("مفعول", new Scheme("مفعول",
                (c1, c2, c3) -> "م" + c1 + c2 + "و" + c3));

        // NORMAL : فاعلة (nom d'agent au féminin)
        schemes.put("فاعلة", new Scheme("فاعلة",
                (c1, c2, c3) -> c1 + "ا" + c2 + "ِ" + c3 + "ة"));

        // MAZID : فعّل (forme intensive)
        schemes.put("فعّل", new Scheme("فعّل",
            (c1, c2, c3) -> c1 + c2 + "ّ" + c3 + "َ"
        ));

        // MAZID : افعل (forme avec préfixe alif)
        schemes.put("افعل", new Scheme("افعل",
                (c1, c2, c3) -> "ا" + c1 + c2 + c3));

        // MAZID : انفعل (forme avec préfixe "ان")
        schemes.put("انفعل", new Scheme("انفعل",
                (c1, c2, c3) -> "ان" + c1 + c2 + c3));

        // MAZID : تفعّل (forme avec préfixe "ت" et redoublement)
        schemes.put("تفعّل", new Scheme("تفعّل",
                (c1, c2, c3) -> "ت" + c1 + c2 + "ّ" + c3 + "َ"));

        // MAZID : استفعل (forme avec préfixe "است")
        schemes.put("استفعل", new Scheme("استفعل",
                (c1, c2, c3) -> "است" + c1 + c2 + c3));

        // MAZID : مفعّل (participe passif de la forme intensive)
        schemes.put("مفعّل", new Scheme("مفعّل",
                (c1, c2, c3) -> "م" + c1 + c2 + "ّ" + c3 + "َ"));

        // MAZID : فعول (forme de nom)
        schemes.put("فعول", new Scheme("فعول",
                (c1, c2, c3) -> "م" + c1 + c2 + "و" + c3));
    }

    // ================= Génération =================
    // Génère un mot à partir d'une racine et d'un schème
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
        node.ajouterDerive(mot);  // On sauvegarde le mot généré
    }

    // ================= Affichage =================
    // Affiche tous les schèmes disponibles
    public void afficherSchemes() {
        System.out.println("\n=== SCHÈMES DISPONIBLES ===");
        for (Scheme s : schemes.values()) {
            String typeInfo = s.isDynamic ? " (dynamique)" : " (explicite)";
            System.out.println("- " + RTLFormatter.rtl(s.nom) + typeInfo);
        }
    }

    // ================= Modification / Suppression =================
    // Modifie un schème existant
    public void modifierScheme(String nom, String nouveauPattern) {
        Scheme oldScheme = schemes.get(nom);
        if (oldScheme == null) {
            System.out.println("❌ Schème introuvable : " + RTLFormatter.rtl(nom));
            return;
        }
        
        // Validation : le nouveau schème doit contenir les lettres ف ع ل
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

    // Supprime un schème
    public void supprimerScheme(String nom) {
        if (schemes.remove(nom) != null) {
            System.out.println("✅ Schème supprimé : " + RTLFormatter.rtl(nom));
        } else {
            System.out.println("❌ Schème introuvable : " + RTLFormatter.rtl(nom));
        }
    }

    // ================= Validation morphologique =================
    // Vérifie si un mot dérive bien d'une racine donnée
    public void validerMot(String racine, String mot) {
        Node node = arbre.rechercher(racine);
        if (node == null) {
            System.out.println("❌ Racine non trouvée : " + RTLFormatter.rtl(racine));
            return;
        }

        // On teste tous les schèmes pour voir si le mot correspond
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
    // Trouve la racine et le schème d'un mot donné
    public void analyserMot(String mot) {
        // On parcourt toutes les racines et tous les schèmes
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
    // Ajoute un nouveau schème à partir d'un pattern (ex: "فاعل")
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
    // Version alternative pour ajouter un schème avec une règle de transformation personnalisée
    public void ajouterScheme(String nom, Scheme.Transformation rule) {
        if (schemes.containsKey(nom)) {
            System.out.println("❌ Ce schème existe déjà !");
            return;
        }
        schemes.put(nom, new Scheme(nom, rule));
        System.out.println("✅ Schème ajouté : " + RTLFormatter.rtl(nom));
    }
    
    // ================= Affichage des dérivés d'une racine =================
    // Affiche tous les mots déjà générés pour une racine donnée
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
    // Retourne la liste de toutes les racines (pour les menus)
    public List<String> getAllRacines() {
        List<String> racines = new ArrayList<>();
        for (Node n : arbre.getAllNodes()) {
            racines.add(n.racine);
        }
        return racines;
    }

    // Retourne la liste de tous les schèmes (pour les menus)
    public List<String> getAllSchemes() {
        return new ArrayList<>(schemes.keySet());
    }
    
    /**
     * Récupère un schème par son nom
     */
    public Scheme getScheme(String schemeName) {
        return schemes.get(schemeName);
    }
}