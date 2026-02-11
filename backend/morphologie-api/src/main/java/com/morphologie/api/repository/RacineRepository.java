package com.morphologie.api.repository;

import com.morphologie.api.model.Racine;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;


// ============= Racine Repository =============
@Repository
public interface RacineRepository extends MongoRepository<Racine, String> {
    
    // Find by racine (unique)
    Optional<Racine> findByRacine(String racine);
    
    // Check if racine exists
    boolean existsByRacine(String racine);
    
    // Delete by racine
    void deleteByRacine(String racine);
}