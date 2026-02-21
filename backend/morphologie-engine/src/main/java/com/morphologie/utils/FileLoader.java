package com.morphologie.utils;

import com.morphologie.engine.AVLTree;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class FileLoader {
    // Charge les racines depuis un fichier et les ajoute dans l'arbre AVL
    public static void chargerRacinesDepuisFichier(String filename, AVLTree arbre) {
        // On ouvre le fichier depuis le dossier resources du projet
        try (InputStream is = FileLoader.class.getClassLoader().getResourceAsStream(filename);
            BufferedReader br = new BufferedReader(
                    new InputStreamReader(is, StandardCharsets.UTF_8))) {
            
            String ligne;
            int count = 0;  // Compteur de racines chargées
            
            // On lit le fichier ligne par ligne
            while ((ligne = br.readLine()) != null) {
                ligne = ligne.trim();  // On enlève les espaces au début et à la fin
                
                // On vérifie que la ligne n'est pas vide et qu'elle contient 3 lettres (une racine arabe)
                if (!ligne.isEmpty() && ligne.length() == 3) {
                    arbre.addRacine(ligne);  // On ajoute la racine dans l'arbre
                    count++;  // On incrémente le compteur
                }
            }
            System.out.println("✅ Chargé " + count + " racines depuis le fichier : " + filename);
            
        } catch (IOException e) {
            // En cas d'erreur (fichier introuvable, problème de lecture...)
            System.out.println("❌ Erreur lecture fichier : " + e.getMessage());
        } catch (NullPointerException e) {
            // Si le fichier n'existe pas dans resources
            System.out.println("❌ Fichier non trouvé : " + filename);
        }
    }
}