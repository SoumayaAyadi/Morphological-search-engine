package com.morphologie.api.service;

import com.morphologie.engine.Morphologie;
import com.morphologie.api.model.Racine;
import com.morphologie.api.repository.RacineRepository;
import com.morphologie.api.exception.*;
import com.morphologie.api.dto.response.RacineWithDerivesResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

// ============= Racine Service =============
@Service
public class RacineService {
    
    private final RacineRepository racineRepository;
    private final Morphologie engine;
    
    public RacineService(RacineRepository racineRepository, Morphologie engine) {
        this.racineRepository = racineRepository;
        this.engine = engine;
    }
    
    /**
     * Add a new racine
     */
    @Transactional
    public Racine addRacine(String racineText) {
        // Validate
        if (racineText == null || racineText.trim().isEmpty()) {
            throw new InvalidRacineException("Racine cannot be empty");
        }
        
        if (racineText.length() != 3) {
            throw new InvalidRacineException("Racine must be exactly 3 letters");
        }
        
        // Check if already exists
        if (racineRepository.existsByRacine(racineText)) {
            throw new RacineAlreadyExistsException(racineText);
        }
        
        // Add to engine AVL tree
        engine.arbre.addRacine(racineText);
        
        // Save to MongoDB
        Racine racine = new Racine(racineText);
        return racineRepository.save(racine);
    }
    
    /**
     * Get all racines
     */
    public List<Racine> getAllRacines() {
        return racineRepository.findAll();
    }
    
    /**
     * Get racine by its text
     */
    public Racine getRacine(String racineText) {
        return racineRepository.findByRacine(racineText)
                .orElseThrow(() -> new RacineNotFoundException(racineText));
    }
    
    /**
     * Get racine with all its derives
     */
    public RacineWithDerivesResponse getRacineWithDerives(String racineText) {
        Racine racine = getRacine(racineText);
        
        RacineWithDerivesResponse response = new RacineWithDerivesResponse();
        response.setRacine(racine.getRacine());
        
        List<RacineWithDerivesResponse.DeriveInfo> derives = racine.getDerives()
                .stream()
                .map(d -> new RacineWithDerivesResponse.DeriveInfo(
                        d.getMot(), 
                        d.getScheme(), 
                        d.getCreatedAt()
                ))
                .collect(Collectors.toList());
        
        response.setDerives(derives);
        response.setTotalDerives(derives.size());
        
        return response;
    }
    
    /**
     * Delete a racine
     */
    @Transactional
    public void deleteRacine(String racineText) {
        if (!racineRepository.existsByRacine(racineText)) {
            throw new RacineNotFoundException(racineText);
        }
        
        racineRepository.deleteByRacine(racineText);
        
        // Note: We don't remove from AVL tree since it would require tree reconstruction
        // In production, you might want to reinitialize the engine or implement AVL delete
    }
    
    /**
     * Get total count of racines
     */
    public long getRacineCount() {
        return racineRepository.count();
    }
}