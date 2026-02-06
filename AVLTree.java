import java.util.ArrayList;
import java.util.List;

public class AVLTree {
    private Node root;

    private int height(Node n) {
        return (n == null) ? 0 : n.height;
    }

    private int getBalance(Node n) {
        return (n == null) ? 0 : height(n.gauche) - height(n.droite);
    }

    private Node rotateRight(Node y) {
        Node x = y.gauche;
        Node T2 = x.droite;

        x.droite = y;
        y.gauche = T2;

        y.height = Math.max(height(y.gauche), height(y.droite)) + 1;
        x.height = Math.max(height(x.gauche), height(x.droite)) + 1;

        return x;
    }

    private Node rotateLeft(Node x) {
        Node y = x.droite;
        Node T2 = y.gauche;

        y.gauche = x;
        x.droite = T2;

        x.height = Math.max(height(x.gauche), height(x.droite)) + 1;
        y.height = Math.max(height(y.gauche), height(y.droite)) + 1;

        return y;
    }

    private Node insert(Node node, String racine) {
        if (node == null)
            return new Node(racine);

        if (racine.compareTo(node.racine) < 0)
            node.gauche = insert(node.gauche, racine);
        else if (racine.compareTo(node.racine) > 0)
            node.droite = insert(node.droite, racine);
        else
            return node;

        node.height = 1 + Math.max(height(node.gauche), height(node.droite));
        int balance = getBalance(node);

        if (balance > 1 && racine.compareTo(node.gauche.racine) < 0)
            return rotateRight(node);

        if (balance < -1 && racine.compareTo(node.droite.racine) > 0)
            return rotateLeft(node);

        if (balance > 1 && racine.compareTo(node.gauche.racine) > 0) {
            node.gauche = rotateLeft(node.gauche);
            return rotateRight(node);
        }

        if (balance < -1 && racine.compareTo(node.droite.racine) < 0) {
            node.droite = rotateRight(node.droite);
            return rotateLeft(node);
        }

        return node;
    }

    public void addRacine(String racine) {
        root = insert(root, racine);
    }

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
        return null;
    }

    public void afficher() {
        System.out.println("\n=== RACINES ET DÉRIVÉS ===");
        if (root == null)
            System.out.println("Aucune racine");
        else
            inOrder(root);
    }

    private void inOrder(Node node) {
        if (node != null) {
            inOrder(node.gauche);
            node.afficher();
            inOrder(node.droite);
        }
    }

    // ================= Méthodes pour l'analyse inversée =================
    public List<Node> getAllNodes() {
        List<Node> nodes = new ArrayList<>();
        inOrderCollect(root, nodes);
        return nodes;
    }

    private void inOrderCollect(Node node, List<Node> nodes) {
        if (node != null) {
            inOrderCollect(node.gauche, nodes);
            nodes.add(node);
            inOrderCollect(node.droite, nodes);
        }
    }
}