package com.morphologie.api.repository;

import com.morphologie.api.model.SchemeModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

// ============= Scheme Repository =============
@Repository
public interface SchemeRepository extends MongoRepository<SchemeModel, String> {
    
    // Find by nom (unique)
    Optional<SchemeModel> findByNom(String nom);
    
    // Check if scheme exists
    boolean existsByNom(String nom);
    
    // Delete by nom
    void deleteByNom(String nom);
    
    // Find by type
    List<SchemeModel> findByType(String type);
    
    // Find dynamic schemes
    List<SchemeModel> findByIsDynamic(boolean isDynamic);
    
    // Find top schemes by usage count
    List<SchemeModel> findTop10ByOrderByUsageCountDesc();
}