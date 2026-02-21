package com.morphologie.engine;

import com.morphologie.utils.RTLFormatter;
import java.util.ArrayList;
import java.util.List;

public class AVLTree {
    private Node root;  // La racine de l'arbre

    // Retourne la hauteur d'un nœud (0 si le nœud est null)
    private int height(Node n) {
        return (n == null) ? 0 : n.height;
    }

    // Calcule la différence de hauteur entre gauche et droite
    // Si c'est positif, gauche est plus lourd, si négatif, droite est plus lourd
    private int getBalance(Node n) {
        return (n == null) ? 0 : height(n.gauche) - height(n.droite);
    }

    // Rotation à droite pour rééquilibrer l'arbre
    // Utilisé quand le sous-arbre gauche est trop lourd
    private Node rotateRight(Node y) {
        Node x = y.gauche;
        Node T2 = x.droite;

        x.droite = y;
        y.gauche = T2;

        y.height = Math.max(height(y.gauche), height(y.droite)) + 1;
        x.height = Math.max(height(x.gauche), height(x.droite)) + 1;

        return x;
    }

    // Rotation à gauche pour rééquilibrer l'arbre
    // Utilisé quand le sous-arbre droit est trop lourd
    private Node rotateLeft(Node x) {
        Node y = x.droite;
        Node T2 = y.gauche;

        y.gauche = x;
        x.droite = T2;

        x.height = Math.max(height(x.gauche), height(x.droite)) + 1;
        y.height = Math.max(height(y.gauche), height(y.droite)) + 1;

        return y;
    }

    // Insertion récursive d'une nouvelle racine
    // Retourne le nouveau nœud ou le nœud modifié après rééquilibrage
    private Node insert(Node node, String racine) {
        if (node == null)
            return new Node(racine);

        // On cherche où insérer le nouveau mot
        if (racine.compareTo(node.racine) < 0)
            node.gauche = insert(node.gauche, racine);
        else if (racine.compareTo(node.racine) > 0)
            node.droite = insert(node.droite, racine);
        else
            return node;  // Mot déjà présent, on ne fait rien

        // Mise à jour de la hauteur après insertion
        node.height = 1 + Math.max(height(node.gauche), height(node.droite));
        int balance = getBalance(node);

        // 4 cas de déséquilibre à vérifier et corriger

        // Cas gauche-gauche : rotation simple à droite
        if (balance > 1 && racine.compareTo(node.gauche.racine) < 0)
            return rotateRight(node);

        // Cas droite-droite : rotation simple à gauche
        if (balance < -1 && racine.compareTo(node.droite.racine) > 0)
            return rotateLeft(node);

        // Cas gauche-droite : d'abord rotation gauche, puis droite
        if (balance > 1 && racine.compareTo(node.gauche.racine) > 0) {
            node.gauche = rotateLeft(node.gauche);
            return rotateRight(node);
        }

        // Cas droite-gauche : d'abord rotation droite, puis gauche
        if (balance < -1 && racine.compareTo(node.droite.racine) < 0) {
            node.droite = rotateRight(node.droite);
            return rotateLeft(node);
        }

        return node;  // Arbre déjà équilibré
    }

    // Ajoute une nouvelle racine après vérification qu'elle n'existe pas déjà
    public void addRacine(String racine) {
        if (rechercher(racine) != null) {
            System.out.println("⚠️ Racine déjà existante : " + RTLFormatter.rtl(racine));
            return;
        }
        root = insert(root, racine);
        System.out.println("✅ Racine ajoutée avec succès : " + RTLFormatter.rtl(racine));
    }

    // Cherche un mot dans l'arbre et retourne le nœud correspondant
    public Node rechercher(String racine) {
        Node current = root;
        while (current != null) {
            if (racine.equals(current.racine))
                return current;
            else if (racine.compareTo(current.racine) < 0)
                current = current.gauche;
            else
                current = current.droite;
        }
        return null;  // Pas trouvé
    }

    // Affiche toutes les racines et leurs dérivés dans l'ordre alphabétique
    public void afficher() {
        System.out.println("\n=== RACINES ET DÉRIVÉS ===");
        if (root == null)
            System.out.println("Aucune racine");
        else
            inOrder(root);
    }

    // Parcours infixe (gauche, racine, droite) pour afficher dans l'ordre
    private void inOrder(Node node) {
        if (node != null) {
            inOrder(node.gauche);
            node.afficher();
            inOrder(node.droite);
        }
    }

    // ================= Méthodes pour l'analyse inversée =================
    
    // Récupère tous les nœuds de l'arbre dans une liste
    public List<Node> getAllNodes() {
        List<Node> nodes = new ArrayList<>();
        inOrderCollect(root, nodes);
        return nodes;
    }

    // Parcours infixe pour remplir la liste de nœuds
    private void inOrderCollect(Node node, List<Node> nodes) {
        if (node != null) {
            inOrderCollect(node.gauche, nodes);
            nodes.add(node);
            inOrderCollect(node.droite, nodes);
        }
    }
}