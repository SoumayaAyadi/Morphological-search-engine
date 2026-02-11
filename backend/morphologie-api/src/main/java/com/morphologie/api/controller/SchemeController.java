package com.morphologie.api.controller;

import com.morphologie.api.dto.request.*;
import com.morphologie.api.dto.response.*;
import com.morphologie.api.model.SchemeModel;
import com.morphologie.api.service.SchemeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * REST Controller for Scheme management
 * Base URL: /api/schemes
 */
@RestController
@RequestMapping("/api/schemes")
@CrossOrigin(origins = "*")
public class SchemeController {
    
    private final SchemeService schemeService;
    
    public SchemeController(SchemeService schemeService) {
        this.schemeService = schemeService;
    }
    
    /**
     * POST /api/schemes - Add a new scheme
     * 
     * Request body:
     * {
     *   "nom": "تفاعل",
     *   "type": "CUSTOM",
     *   "description": "Optional description"
     * }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SchemeModel>> addScheme(
            @Valid @RequestBody AddSchemeRequest request) {
        
        SchemeModel scheme = schemeService.addScheme(
                request.getNom(), 
                request.getType(), 
                request.getDescription()
        );
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Scheme added successfully", scheme));
    }
    
    /**
     * GET /api/schemes - Get all schemes
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SchemeModel>>> getAllSchemes() {
        List<SchemeModel> schemes = schemeService.getAllSchemes();
        return ResponseEntity.ok(
                ApiResponse.success("Retrieved all schemes", schemes)
        );
    }
    
    /**
     * GET /api/schemes/{nom} - Get specific scheme
     */
    @GetMapping("/{nom}")
    public ResponseEntity<ApiResponse<SchemeModel>> getScheme(@PathVariable String nom) {
        SchemeModel scheme = schemeService.getScheme(nom);
        return ResponseEntity.ok(
                ApiResponse.success("Scheme found", scheme)
        );
    }
    
    /**
     * GET /api/schemes/types/{type} - Get schemes by type
     * Types: NORMAL, MAZID, CUSTOM
     */
    @GetMapping("/types/{type}")
    public ResponseEntity<ApiResponse<List<SchemeModel>>> getSchemesByType(
            @PathVariable String type) {
        
        List<SchemeModel> schemes = schemeService.getSchemesByType(type);
        return ResponseEntity.ok(
                ApiResponse.success("Retrieved schemes by type", schemes)
        );
    }
    
    /**
     * PUT /api/schemes/{nom} - Modify a scheme
     * 
     * Request body:
     * {
     *   "newPattern": "تفعول"
     * }
     */
    @PutMapping("/{nom}")
    public ResponseEntity<ApiResponse<SchemeModel>> modifyScheme(
            @PathVariable String nom,
            @Valid @RequestBody ModifySchemeRequest request) {
        
        SchemeModel updated = schemeService.modifyScheme(nom, request.getNewPattern());
        return ResponseEntity.ok(
                ApiResponse.success("Scheme modified successfully", updated)
        );
    }
    
    /**
     * DELETE /api/schemes/{nom} - Delete a scheme
     */
    @DeleteMapping("/{nom}")
    public ResponseEntity<ApiResponse<Void>> deleteScheme(@PathVariable String nom) {
        schemeService.deleteScheme(nom);
        return ResponseEntity.ok(
                ApiResponse.success("Scheme deleted successfully", null)
        );
    }
    
    /**
     * GET /api/schemes/stats/popular - Get most popular schemes
     */
    @GetMapping("/stats/popular")
    public ResponseEntity<ApiResponse<List<SchemeModel>>> getPopularSchemes() {
        List<SchemeModel> schemes = schemeService.getPopularSchemes();
        return ResponseEntity.ok(
                ApiResponse.success("Retrieved popular schemes", schemes)
        );
    }
}