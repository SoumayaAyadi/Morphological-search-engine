import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Morphologie engine = new Morphologie();
        Scanner sc = new Scanner(System.in, "UTF-8");

        boolean run = true;
        while (run) {
            System.out.println("\n1. Ajouter racine");
            System.out.println("2. Générer mot");
            System.out.println("3. Afficher tout");
            System.out.println("4. Afficher schèmes");
            System.out.println("0. Quitter");
            System.out.print("Choix : ");

            String c = sc.nextLine();

            switch (c) {
                case "1":
                    System.out.print("Racine (3 lettres) : ");
                    String racine = sc.nextLine();
                    if (racine.length() == 3)
                        engine.arbre.addRacine(racine);
                    else
                        System.out.println("❌ Racine invalide, doit être 3 lettres.");
                    break;

                case "2":
                    System.out.print("Racine : ");
                    String r = sc.nextLine();
                    System.out.print("Schème : ");
                    String s = sc.nextLine();
                    engine.generer(r, s);
                    break;

                case "3":
                    engine.arbre.afficher();
                    break;

                case "4":
                    engine.afficherSchemes();
                    break;

                case "0":
                    run = false;
                    break;

                default:
                    System.out.println("❌ Choix invalide");
            }
        }
        sc.close();
        System.out.println("Au revoir!");
    }
}