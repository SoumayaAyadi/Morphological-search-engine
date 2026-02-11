package com.morphologie.api.controller;

import com.morphologie.api.dto.request.*;
import com.morphologie.api.dto.response.*;
import com.morphologie.api.model.Racine;
import com.morphologie.api.service.RacineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * REST Controller for Racine management
 * Base URL: /api/racines
 */
@RestController
@RequestMapping("/api/racines")
@CrossOrigin(origins = "*")  // Configure properly in production
public class RacineController {
    
    private final RacineService racineService;
    
    public RacineController(RacineService racineService) {
        this.racineService = racineService;
    }
    
    /**
     * POST /api/racines - Add a new racine
     * 
     * Request body:
     * {
     *   "racine": "كتب"
     * }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Racine>> addRacine(
            @Valid @RequestBody AddRacineRequest request) {
        
        Racine racine = racineService.addRacine(request.getRacine());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Racine added successfully", racine));
    }
    
    /**
     * GET /api/racines - Get all racines
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Racine>>> getAllRacines() {
        List<Racine> racines = racineService.getAllRacines();
        return ResponseEntity.ok(
                ApiResponse.success("Retrieved all racines", racines)
        );
    }
    
    /**
     * GET /api/racines/{racine} - Get specific racine
     */
    @GetMapping("/{racine}")
    public ResponseEntity<ApiResponse<Racine>> getRacine(@PathVariable String racine) {
        Racine found = racineService.getRacine(racine);
        return ResponseEntity.ok(
                ApiResponse.success("Racine found", found)
        );
    }
    
    /**
     * GET /api/racines/{racine}/derives - Get all derived words for a racine
     */
    @GetMapping("/{racine}/derives")
    public ResponseEntity<ApiResponse<RacineWithDerivesResponse>> getRacineDerives(
            @PathVariable String racine) {
        
        RacineWithDerivesResponse response = racineService.getRacineWithDerives(racine);
        return ResponseEntity.ok(
                ApiResponse.success("Retrieved derives for racine", response)
        );
    }
    
    /**
     * DELETE /api/racines/{racine} - Delete a racine
     */
    @DeleteMapping("/{racine}")
    public ResponseEntity<ApiResponse<Void>> deleteRacine(@PathVariable String racine) {
        racineService.deleteRacine(racine);
        return ResponseEntity.ok(
                ApiResponse.success("Racine deleted successfully", null)
        );
    }
    
    /**
     * GET /api/racines/stats/count - Get total count of racines
     */
    @GetMapping("/stats/count")
    public ResponseEntity<ApiResponse<Long>> getRacineCount() {
        long count = racineService.getRacineCount();
        return ResponseEntity.ok(
                ApiResponse.success("Total racines count", count)
        );
    }
}