import java.util.Scanner;
import java.util.List;

public class Main {
    public static void main(String[] args) throws Exception {
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
System.out.println("9. Ajouter un nouveau schème"); // ← Ajouté
System.out.println("10. Afficher les dérivés d'une racine");
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
                    // === Afficher toutes les racines ===
                    List<String> racines = engine.getAllRacines();
                    if (racines.isEmpty()) {
                        System.out.println("❌ Aucune racine disponible");
                        break;
                    }
                    System.out.println("Liste des racines disponibles:");
                    for (int i = 0; i < racines.size(); i++) {
                        System.out.println((i + 1) + ") " + racines.get(i));
                    }
                    System.out.print("Choix racine (numéro) : ");
                    int choixRacine = Integer.parseInt(sc.nextLine());
                    String r = racines.get(choixRacine - 1);

                    // === Afficher tous les schèmes ===
                    List<String> schemes = engine.getAllSchemes();
                    System.out.println("Liste des schèmes disponibles:");
                    for (int i = 0; i < schemes.size(); i++) {
                        System.out.println((i + 1) + ") " + schemes.get(i));
                    }
                    System.out.print("Choix schème (numéro) : ");
                    int choixScheme = Integer.parseInt(sc.nextLine());
                    String s = schemes.get(choixScheme - 1);

                    // Générer le mot
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
                    System.out.print("Racine : ");
                    String racineVal = sc.nextLine();
                    System.out.print("Mot à valider : ");
                    String motVal = sc.nextLine();
                    engine.validerMot(racineVal, motVal);
                    break;

                case "8":
                    System.out.print("Mot à analyser : ");
                    String motAnalyse = sc.nextLine();
                    engine.analyserMot(motAnalyse);
                    break;
             case "9":
    System.out.print("Nom du nouveau schème : ");
    String nom = sc.nextLine();

    System.out.print("Type (NORMAL / NAQIS / MAZID) : ");
    String type = sc.nextLine();

    // Exemple de règle par défaut (tu peux personnaliser la fonction)
    Scheme.Transformation rule = (c1, c2, c3) -> c1 + c2 + c3;

    engine.ajouterScheme(nom, type, rule);
    break;

case "10":
    System.out.print("Racine pour afficher ses dérivés : ");
    String rDerives = sc.nextLine();
    engine.afficherDerivesRacine(rDerives);
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