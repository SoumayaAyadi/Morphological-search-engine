package com.morphologie.api.controller;

import com.morphologie.api.dto.request.*;
import com.morphologie.api.dto.response.*;
import com.morphologie.api.service.MorphologyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


// ============= Morphology Controller =============

/**
 * REST Controller for Morphology operations
 * Base URL: /api/morphology
 */
@RestController
@RequestMapping("/api/morphology")
@CrossOrigin(origins = "*")
public class MorphologyController {
    
    private final MorphologyService morphologyService;
    
    public MorphologyController(MorphologyService morphologyService) {
        this.morphologyService = morphologyService;
    }
    
    /**
     * POST /api/morphology/generate - Generate word from racine + scheme
     * 
     * Request body:
     * {
     *   "racine": "كتب",
     *   "scheme": "فاعل"
     * }
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<GeneratedWordResponse>> generateWord(
            @Valid @RequestBody GenerateWordRequest request) {
        
        GeneratedWordResponse response = morphologyService.generateWord(
                request.getRacine(), 
                request.getScheme()
        );
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Word generated successfully", response));
    }
    
    /**
     * POST /api/morphology/validate - Validate if word belongs to racine
     * 
     * Request body:
     * {
     *   "racine": "كتب",
     *   "mot": "كاتب"
     * }
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidationResponse>> validateWord(
            @Valid @RequestBody ValidateWordRequest request) {
        
        ValidationResponse response = morphologyService.validateWord(
                request.getRacine(), 
                request.getMot()
        );
        
        String message = response.isValid() 
                ? "Word is valid for this racine" 
                : "Word does not belong to this racine";
        
        return ResponseEntity.ok(
                ApiResponse.success(message, response)
        );
    }
    
    /**
     * POST /api/morphology/analyze - Reverse analysis: word → racine + scheme
     * 
     * Request body:
     * {
     *   "mot": "كاتب"
     * }
     */
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<AnalysisResponse>> analyzeWord(
            @Valid @RequestBody AnalyzeWordRequest request) {
        
        AnalysisResponse response = morphologyService.analyzeWord(request.getMot());
        
        String message = response.isFound() 
                ? "Word analysis successful" 
                : "Word not found in database";
        
        return ResponseEntity.ok(
                ApiResponse.success(message, response)
        );
    }
}