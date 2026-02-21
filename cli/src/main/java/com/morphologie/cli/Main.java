package com.morphologie.cli;

import com.morphologie.engine.Morphologie;
import com.morphologie.utils.FileLoader;
import com.morphologie.utils.RTLFormatter;
import java.util.Scanner;
import java.util.List;

public class Main {
    public static void main(String[] args) throws Exception {
        // Initialisation du moteur de morphologie
        Morphologie engine = new Morphologie();
        
        // Chargement automatique des racines depuis le fichier racines.txt
        FileLoader.chargerRacinesDepuisFichier("racines.txt", engine.arbre);
        
        // Scanner pour lire les entrées utilisateur (avec support de l'UTF-8 pour l'arabe)
        Scanner sc = new Scanner(System.in, "UTF-8");

        boolean run = true;  // Contrôle de la boucle principale
        while (run) {
            // Affichage du menu principal
            System.out.println("\n1. Ajouter racine");
            System.out.println("2. Générer mot");
            System.out.println("3. Afficher tout");
            System.out.println("4. Afficher schèmes");
            System.out.println("5. Modifier un schème");
            System.out.println("6. Supprimer un schème");
            System.out.println("7. Valider un mot");
            System.out.println("8. Analyser un mot");
            System.out.println("9. Ajouter un nouveau schème");
            System.out.println("10. Afficher les dérivés d'une racine");
            System.out.println("0. Quitter");
            System.out.print("Choix : ");

            // Vérification que l'utilisateur a bien entré quelque chose
            if (!sc.hasNextLine()) {
                System.out.println("\n⛔ Interruption détectée. Fermeture propre...");
                break;
            }
            String c = sc.nextLine();

            // Traitement du choix de l'utilisateur
            switch (c) {
                case "1":
                    // Ajout d'une nouvelle racine
                    System.out.print("Racine (3 lettres) : ");
                    String racine = sc.nextLine();
                    if (racine.length() == 3)
                        engine.arbre.addRacine(racine);
                    else
                        System.out.println("❌ Racine invalide, doit être 3 lettres.");
                    break;

                case "2":
                    // Génération d'un mot à partir d'une racine et d'un schème
                    
                    // === Étape 1 : choisir une racine dans la liste ===
                    List<String> racines = engine.getAllRacines();
                    if (racines.isEmpty()) {
                        System.out.println("❌ Aucune racine disponible");
                        break;
                    }
                    System.out.println("Liste des racines disponibles:");
                    for (int i = 0; i < racines.size(); i++) {
                        System.out.println((i + 1) + ") " + RTLFormatter.rtl(racines.get(i)));
                    }
                    System.out.print("Choix racine (numéro) : ");
                    int choixRacine = Integer.parseInt(sc.nextLine());
                    String r = racines.get(choixRacine - 1);

                    // === Étape 2 : choisir un schème dans la liste ===
                    List<String> schemes = engine.getAllSchemes();
                    System.out.println("Liste des schèmes disponibles:");
                    for (int i = 0; i < schemes.size(); i++) {
                        System.out.println((i + 1) + ") " + RTLFormatter.rtl(schemes.get(i)));
                    }
                    System.out.print("Choix schème (numéro) : ");
                    int choixScheme = Integer.parseInt(sc.nextLine());
                    String s = schemes.get(choixScheme - 1);

                    // === Étape 3 : générer le mot ===
                    engine.generer(r, s);
                    break;

                case "3":
                    // Affiche toutes les racines et leurs dérivés
                    engine.arbre.afficher();
                    break;

                case "4":
                    // Affiche tous les schèmes disponibles
                    engine.afficherSchemes();
                    break;

                case "5":
                    // Modification d'un schème existant
                    System.out.print("Nom du schème à modifier : ");
                    String nomMod = sc.nextLine();
                    System.out.print("Nouveau schème (utilise ف ع ل) : ");
                    String pattern = sc.nextLine();
                    engine.modifierScheme(nomMod, pattern);
                    break;

                case "6":
                    // Suppression d'un schème
                    System.out.print("Nom du schème à supprimer : ");
                    String nomSup = sc.nextLine();
                    engine.supprimerScheme(nomSup);
                    break;

                case "7":
                    // Validation : vérifier si un mot dérive bien d'une racine
                    System.out.print("Racine : ");
                    String racineVal = sc.nextLine();
                    System.out.print("Mot à valider : ");
                    String motVal = sc.nextLine();
                    engine.validerMot(racineVal, motVal);
                    break;

                case "8":
                    // Analyse inversée : trouver la racine d'un mot
                    System.out.print("Mot à analyser : ");
                    String motAnalyse = sc.nextLine();
                    engine.analyserMot(motAnalyse);
                    break;
                    
                case "9":
                    // Ajout d'un nouveau schème (dynamique)
                    System.out.println("\n=== AJOUTER UN NOUVEAU SCHÈME ===");
                    System.out.println("Instructions : Entrez le schème directement avec " + RTLFormatter.rtl("ف ع ل")); 
                    System.out.println("Exemple :");
                    System.out.println("  - Tapez : " + RTLFormatter.rtl("تفاعل"));

                    System.out.println();
                    
                    System.out.print("Schème : ");
                    String nom = sc.nextLine();

                    engine.ajouterScheme(nom);
                    break;

                case "10":
                    // Affiche tous les dérivés d'une racine spécifique
                    System.out.print("Racine pour afficher ses dérivés : ");
                    String rDerives = sc.nextLine();
                    engine.afficherDerivesRacine(rDerives);
                    break;

                case "0":
                    // Quitter le programme
                    run = false;
                    break;

                default:
                    System.out.println("❌ Choix invalide");
            }
        }
        
        // Nettoyage et message de fin
        sc.close();
        System.out.println("=".repeat(30) + "   bye bye :)   " + "=".repeat(30));
    }
}