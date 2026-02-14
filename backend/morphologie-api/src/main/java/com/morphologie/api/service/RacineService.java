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

@Service
public class RacineService {
    
    private final RacineRepository racineRepository;
    private final Morphologie engine;
    
    public RacineService(RacineRepository racineRepository, Morphologie engine) {
        this.racineRepository = racineRepository;
        this.engine = engine;
    }
    
    @Transactional
    public Racine addRacine(String racineText) {
        if (racineText == null || racineText.trim().isEmpty()) {
            throw new InvalidRacineException("Racine cannot be empty");
        }
        if (racineText.length() != 3) {
            throw new InvalidRacineException("Racine must be exactly 3 letters");
        }
        if (racineRepository.existsByRacine(racineText)) {
            throw new RacineAlreadyExistsException(racineText);
        }
        
        engine.arbre.addRacine(racineText);
        Racine racine = new Racine(racineText);
        return racineRepository.save(racine);
    }
    
    public List<Racine> getAllRacines() {
        return racineRepository.findAll();
    }
    
    public Racine getRacine(String racineText) {
        return racineRepository.findByRacine(racineText)
                .orElseThrow(() -> new RacineNotFoundException(racineText));
    }
    
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
    
    @Transactional
    public Racine updateRacine(String oldRacine, String newRacine) {
        System.out.println("🔄 Updating in service: " + oldRacine + " -> " + newRacine);
        
        Racine racine = racineRepository.findByRacine(oldRacine)
                .orElseThrow(() -> new RacineNotFoundException(oldRacine));
        
        if (!oldRacine.equals(newRacine) && racineRepository.existsByRacine(newRacine)) {
            throw new RacineAlreadyExistsException(newRacine);
        }
        
        racine.setRacine(newRacine);
        Racine updated = racineRepository.save(racine);
        
        try {
            engine.arbre.addRacine(newRacine);
        } catch (Exception e) {
            System.err.println("⚠️ Warning: Could not update engine: " + e.getMessage());
        }
        
        return updated;
    }
    
  @Transactional
public void deleteRacine(String racineText) {
    System.out.println("🟢 Service: Attempting to delete racine: '" + racineText + "'");
    
    // تأكد بلي الجذر موجود قبل الحذف
    if (!racineRepository.existsByRacine(racineText)) {
        System.out.println("🔴 Racine not found: " + racineText);
        throw new RacineNotFoundException(racineText);
    }
    
    racineRepository.deleteByRacine(racineText);
    System.out.println("✅ Racine deleted successfully: " + racineText);
}
    public long getRacineCount() {
        return racineRepository.count();
    }
}