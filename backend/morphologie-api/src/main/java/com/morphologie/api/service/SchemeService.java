package com.morphologie.api.service;

import com.morphologie.engine.Morphologie;
import com.morphologie.api.model.SchemeModel;
import com.morphologie.api.repository.SchemeRepository;
import com.morphologie.api.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

// ============= Scheme Service =============
@Service
public class SchemeService {
    
    private final SchemeRepository schemeRepository;
    private final Morphologie engine;
    
    public SchemeService(SchemeRepository schemeRepository, Morphologie engine) {
        this.schemeRepository = schemeRepository;
        this.engine = engine;
    }
    
    /**
     * Add a new scheme
     */
    @Transactional
    public SchemeModel addScheme(String nom, String type, String description) {
        // Validate
        if (nom == null || nom.trim().isEmpty()) {
            throw new InvalidSchemeException("Scheme name cannot be empty");
        }
        
        // Validate contains ف ع ل
        if (!nom.contains("ف") || !nom.contains("ع") || !nom.contains("ل")) {
            throw new InvalidSchemeException("Scheme must contain ف ع ل");
        }
        
        // Check if already exists
        if (schemeRepository.existsByNom(nom)) {
            throw new SchemeAlreadyExistsException(nom);
        }
        
        // Add to engine
        engine.ajouterScheme(nom);
        
        // Save to MongoDB
        SchemeModel scheme = new SchemeModel(nom, nom, true, type != null ? type : "CUSTOM");
        scheme.setDescription(description);
        return schemeRepository.save(scheme);
    }
    
    /**
     * Get all schemes
     */
    public List<SchemeModel> getAllSchemes() {
        return schemeRepository.findAll();
    }
    
    /**
     * Get scheme by name
     */
    public SchemeModel getScheme(String nom) {
        return schemeRepository.findByNom(nom)
                .orElseThrow(() -> new SchemeNotFoundException(nom));
    }
    
    /**
     * Get schemes by type
     */
    public List<SchemeModel> getSchemesByType(String type) {
        return schemeRepository.findByType(type);
    }
    
    /**
     * Modify an existing scheme
     */
    @Transactional
    public SchemeModel modifyScheme(String nom, String newPattern) {
        SchemeModel scheme = getScheme(nom);
        
        // Validate new pattern
        if (!newPattern.contains("ف") || !newPattern.contains("ع") || !newPattern.contains("ل")) {
            throw new InvalidSchemeException("New pattern must contain ف ع ل");
        }
        
        // Modify in engine
        engine.modifierScheme(nom, newPattern);
        
        // Update in MongoDB
        scheme.setNom(newPattern);
        scheme.setPattern(newPattern);
        return schemeRepository.save(scheme);
    }
    
    /**
     * Delete a scheme
     */
    @Transactional
    public void deleteScheme(String nom) {
        if (!schemeRepository.existsByNom(nom)) {
            throw new SchemeNotFoundException(nom);
        }
        
        // Remove from engine
        engine.supprimerScheme(nom);
        
        // Delete from MongoDB
        schemeRepository.deleteByNom(nom);
    }
    
    /**
     * Get most popular schemes
     */
    public List<SchemeModel> getPopularSchemes() {
        return schemeRepository.findTop10ByOrderByUsageCountDesc();
    }
    
    /**
     * Get total count of schemes
     */
    public long getSchemeCount() {
        return schemeRepository.count();
    }
}




