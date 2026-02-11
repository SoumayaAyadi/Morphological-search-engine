package com.morphologie.api.service;

import com.morphologie.engine.Morphologie;
import com.morphologie.engine.Node;
import com.morphologie.engine.Scheme;
import com.morphologie.api.model.Racine;
import com.morphologie.api.model.SchemeModel;
import com.morphologie.api.repository.RacineRepository;
import com.morphologie.api.repository.SchemeRepository;
import com.morphologie.api.exception.*;
import com.morphologie.api.dto.response.GeneratedWordResponse;
import com.morphologie.api.dto.response.AnalysisResponse;
import com.morphologie.api.dto.response.ValidationResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class MorphologyService {
    
    private final Morphologie engine;  // Your existing morphology engine
    private final RacineRepository racineRepository;
    private final SchemeRepository schemeRepository;
    
    public MorphologyService(RacineRepository racineRepository, 
                            SchemeRepository schemeRepository) {
        this.engine = new Morphologie();
        this.racineRepository = racineRepository;
        this.schemeRepository = schemeRepository;
    }
    
    /**
     * Initialize engine from database on startup
     * Load all racines into AVL tree and sync schemes
     */
    @PostConstruct
    public void initializeEngine() {
        System.out.println("=== Initializing Morphology Engine ===");
        
        // Load all racines from MongoDB into AVL tree
        List<Racine> racines = racineRepository.findAll();
        for (Racine r : racines) {
            engine.arbre.addRacine(r.getRacine());
            
            // Also add derives to the node
            Node node = engine.arbre.rechercher(r.getRacine());
            if (node != null && r.getDerives() != null) {
                r.getDerives().forEach(d -> 
                    node.ajouterDerive(d.getMot(), d.getScheme())
                );
            }
        }
        
        // Sync custom schemes from MongoDB
        List<SchemeModel> customSchemes = schemeRepository.findByIsDynamic(true);
        for (SchemeModel s : customSchemes) {
            engine.ajouterScheme(s.getNom());
        }
        
        System.out.println("✅ Engine initialized with " + racines.size() + " racines");
        System.out.println("✅ Loaded " + customSchemes.size() + " custom schemes");
    }
    
    /**
     * Generate a word from racine + scheme
     */
    @Transactional
    public GeneratedWordResponse generateWord(String racine, String schemeName) {
        // Validate racine exists in DB
        Racine racineEntity = racineRepository.findByRacine(racine)
                .orElseThrow(() -> new RacineNotFoundException(racine));
        
        // Validate scheme exists
        SchemeModel schemeEntity = schemeRepository.findByNom(schemeName)
                .orElseThrow(() -> new SchemeNotFoundException(schemeName));
        
        // Generate word using engine
        Node node = engine.arbre.rechercher(racine);
        if (node == null) {
            // Sync issue - add to engine
            engine.arbre.addRacine(racine);
            node = engine.arbre.rechercher(racine);
        }
        
        // Get scheme from engine and generate
        String generatedWord = null;
        try {
            // Use engine's generate method
            Scheme scheme = engine.getScheme(schemeName);
            if (scheme == null) {
                throw new SchemeNotFoundException(schemeName);
            }
            
            generatedWord = scheme.generate(racine);
            if (generatedWord == null) {
                throw new WordGenerationException("Failed to generate word");
            }
            
            // Add to node's derives
            node.ajouterDerive(generatedWord, schemeName);
            
            // Save to MongoDB
            racineEntity.addDerive(generatedWord, schemeName);
            racineRepository.save(racineEntity);
            
            // Increment scheme usage count
            schemeEntity.incrementUsage();
            schemeRepository.save(schemeEntity);
            
        } catch (Exception e) {
            throw new WordGenerationException("Error generating word: " + e.getMessage());
        }
        
        return new GeneratedWordResponse(generatedWord, racine, schemeName);
    }
    
    /**
     * Validate if a word belongs to a racine
     */
    public ValidationResponse validateWord(String racine, String mot) {
        // Check if racine exists
        Racine racineEntity = racineRepository.findByRacine(racine)
                .orElseThrow(() -> new RacineNotFoundException(racine));
        
        // Try all schemes to see if word matches
        List<SchemeModel> allSchemes = schemeRepository.findAll();
        
        for (SchemeModel schemeModel : allSchemes) {
            Scheme engineScheme = engine.getScheme(schemeModel.getNom());
            if (engineScheme != null) {
                String generated = engineScheme.generate(racine);
                if (mot.equals(generated)) {
                    // Valid! Add to derives if not already there
                    racineEntity.addDerive(mot, schemeModel.getNom());
                    racineRepository.save(racineEntity);
                    
                    // Also add to engine node
                    Node node = engine.arbre.rechercher(racine);
                    if (node != null) {
                        node.ajouterDerive(mot, schemeModel.getNom());
                    }
                    
                    return new ValidationResponse(true, racine, mot, schemeModel.getNom());
                }
            }
        }
        
        // Not valid
        return new ValidationResponse(false, racine, mot, null);
    }
    
    /**
     * Reverse analysis: find racine and scheme for any given word
     * The word doesn't need to be pre-saved; it will be analyzed against all available racines and schemes
     */
    public AnalysisResponse analyzeWord(String mot) {
        if (mot == null || mot.trim().isEmpty()) {
            return new AnalysisResponse(mot, null, null, false);
        }
        
        // Get all available racines and schemes
        List<Racine> allRacines = racineRepository.findAll();
        List<SchemeModel> allSchemes = schemeRepository.findAll();
        
        // Try to match the word against all possible combinations
        for (Racine racine : allRacines) {
            for (SchemeModel schemeModel : allSchemes) {
                Scheme engineScheme = engine.getScheme(schemeModel.getNom());
                if (engineScheme != null) {
                    String generated = engineScheme.generate(racine.getRacine());
                    if (mot.equals(generated)) {
                        // Found a match
                        return new AnalysisResponse(mot, racine.getRacine(), 
                                                   schemeModel.getNom(), true);
                    }
                }
            }
        }
        
        // Word could not be decomposed with any available racine and scheme
        return new AnalysisResponse(mot, null, null, false);
    }
    
    /**
     * Get all racines from database
     */
    public List<Racine> getAllRacines() {
        return racineRepository.findAll();
    }
    
    /**
     * Get all schemes from database
     */
    public List<SchemeModel> getAllSchemes() {
        return schemeRepository.findAll();
    }
}