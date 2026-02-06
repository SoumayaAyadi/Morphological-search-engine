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
            System.out.println("âœ… ØªÙ… ØªØ­Ù…ÙŠÙ„ " + count + " Ø¬Ø°Ø± Ù…Ù† Ø§Ù„Ù…Ù„Ù: " + filename);
            
        } catch (FileNotFoundException e) {
            System.out.println("âŒ Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯: " + filename);
        } catch (IOException e) {
            System.out.println("âŒ Ø®Ø·Ø£ ÙÙŠ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…Ù„Ù: " + e.getMessage());
        }
    }
}
