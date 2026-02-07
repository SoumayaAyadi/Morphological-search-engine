// HashTable.java 
import java.util.HashMap; 
 
public class HashTable { 
    private HashMap<String, String> schemes; 
 
    public HashTable() { 
        schemes = new HashMap<>(); 
    } 
 
    public void addScheme(String nom, String pattern) { 
        schemes.put(nom, pattern); 
    } 
 
    public String getScheme(String nom) { 
        return schemes.get(nom); 
    } 
 
    public void afficherSchemes() { 
        System.out.println("\n=== PATTERNS ==="); 
        for (String key : schemes.keySet()) { 
            System.out.println(key + " -> " + schemes.get(key)); 
        } 
    } 
} 
