import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Morphologie engine = new Morphologie();
FileLoader.chargerRacinesDepuisFichier("racines.txt", engine.arbre);
Scanner sc = new Scanner(System.in, "UTF-8");

        boolean run = true;
        while (run) {
            System.out.println("\n1. Ajouter racine");
            System.out.println("2. Générer mot");
            System.out.println("3. Afficher tout");
            System.out.println("4. Afficher schèmes");
            System.out.println("5. Modifier un schème");
            System.out.println("6. Supprimer un schème");
            System.out.println("7. Valider un mot");
            System.out.println("8. Analyser un mot");
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

                case "5":
                    System.out.print("Nom du schème à modifier : ");
                    String nomMod = sc.nextLine();
                    System.out.print("Nouveau pattern : ");
                    String pattern = sc.nextLine();
                    engine.modifierScheme(nomMod, pattern);
                    break;

                case "6":
                    System.out.print("Nom du schème à supprimer : ");
                    String nomSup = sc.nextLine();
                    engine.supprimerScheme(nomSup);
                    break;

                case "7":
                    System.out.print("Mot à valider : ");
                    String motVal = sc.nextLine();
                    System.out.print("Racine correspondante : ");
                    String racineVal = sc.nextLine();
                    engine.validerMot(motVal, racineVal);
                    break;

                case "8":
                    System.out.print("Mot à analyser : ");
                    String motAnalyse = sc.nextLine();
                    engine.analyserMot(motAnalyse);
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