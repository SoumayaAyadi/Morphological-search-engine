// TestSimple.java
public class TestSimple {
    public static void main(String[] args) {
        System.out.println("=== Test START ===");
        
        // Test AVLTree
        AVLTree tree = new AVLTree();
        tree.addRacine("ktb");
        tree.addRacine("qra");
        tree.addRacine("sm3");
        
        System.out.println("Tree created with 3 roots");
        
        // Test Node search
        Node node = tree.rechercher("ktb");
        if (node != null) {
            System.out.println("Found root: ktb");
            node.ajouterDerive("kateb");
            node.ajouterDerive("maktoub");
        }
        
        tree.afficher();
        
        System.out.println("=== Test END ===");
    }
}
