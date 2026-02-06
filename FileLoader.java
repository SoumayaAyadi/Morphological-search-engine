// FileLoader.java
import java.io.*;
import java.nio.charset.StandardCharsets;

public class FileLoader {
    public static void chargerRacinesDepuisFichier(String filename, AVLTree arbre) {
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(new FileInputStream(filename), StandardCharsets.UTF_8))) {
            
            String ligne;
            int count = 0;
            while ((ligne = br.readLine()) != null) {
                ligne = ligne.trim();
                if (!ligne.isEmpty() && ligne.length() == 3) {
                    arbre.addRacine(ligne);
                    count++;
                }
            }
            System.out.println("✅ Chargé " + count + " racines depuis le fichier : " + filename);
            
        } catch (FileNotFoundException e) {
            System.out.println("❌ Fichier non trouvé : " + filename);
        } catch (IOException e) {
            System.out.println("❌ Erreur lecture fichier : " + e.getMessage());
        }
    }
}