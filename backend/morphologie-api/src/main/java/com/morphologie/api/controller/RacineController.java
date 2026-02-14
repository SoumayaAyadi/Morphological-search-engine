package com.morphologie.api.controller;

import com.morphologie.api.dto.request.*;
import com.morphologie.api.dto.response.*;
import com.morphologie.api.model.Racine;
import com.morphologie.api.service.RacineService;
import com.morphologie.api.exception.RacineNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/racines")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RacineController {
    
    private final RacineService racineService;
    
    public RacineController(RacineService racineService) {
        this.racineService = racineService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Racine>> addRacine(
            @Valid @RequestBody AddRacineRequest request) {
        
        Racine racine = racineService.addRacine(request.getRacine());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Racine added successfully", racine));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Racine>>> getAllRacines() {
        List<Racine> racines = racineService.getAllRacines();
        return ResponseEntity.ok(
                ApiResponse.success("Retrieved all racines", racines)
        );
    }
    
    @GetMapping("/{racine}")
    public ResponseEntity<ApiResponse<Racine>> getRacine(@PathVariable String racine) {
        Racine found = racineService.getRacine(racine);
        return ResponseEntity.ok(
                ApiResponse.success("Racine found", found)
        );
    }
    
    @GetMapping("/{racine}/derives")
    public ResponseEntity<ApiResponse<RacineWithDerivesResponse>> getRacineDerives(
            @PathVariable String racine) {
        
        RacineWithDerivesResponse response = racineService.getRacineWithDerives(racine);
        return ResponseEntity.ok(
                ApiResponse.success("Retrieved derives for racine", response)
        );
    }
    
    @PutMapping("/{racine}")
    public ResponseEntity<ApiResponse<Racine>> updateRacine(
            @PathVariable String racine,
            @Valid @RequestBody UpdateRacineRequest request) {
        
        System.out.println("🔄 Updating racine: " + racine + " to: " + request.getRacine());
        
        Racine updated = racineService.updateRacine(racine, request.getRacine());
        
        return ResponseEntity.ok(
                ApiResponse.success("Racine updated successfully", updated)
        );
    }
    
  @DeleteMapping("/{racine}")
public ResponseEntity<ApiResponse<Void>> deleteRacine(@PathVariable String racine) {
    // ✅ طبع القيمة في الـ console باش نشوف واش وصلت
    System.out.println("🟢 DELETE request received for racine: '" + racine + "'");
    System.out.println("🟢 Length: " + racine.length());
    System.out.println("🟢 Unicode bytes: " + Arrays.toString(racine.getBytes(StandardCharsets.UTF_8)));
    
    racineService.deleteRacine(racine);
    return ResponseEntity.ok(
            ApiResponse.success("Racine deleted successfully", null)
    );
}
    
    @GetMapping("/stats/count")
    public ResponseEntity<ApiResponse<Long>> getRacineCount() {
        long count = racineService.getRacineCount();
        return ResponseEntity.ok(
                ApiResponse.success("Total racines count", count)
        );
    }
}