package com.morphologie.api.repository;

import com.morphologie.api.model.Racine;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RacineRepository extends MongoRepository<Racine, String> {
    
    // ✅ هذه الدالة تبحث بالجذر (مش بالـ id)
    Optional<Racine> findByRacine(String racine);
    
    // ✅ هذه الدالة تتحقق من الوجود
    boolean existsByRacine(String racine);
    
    // ✅ هذه الدالة تحذف بالجذر
    void deleteByRacine(String racine);
}