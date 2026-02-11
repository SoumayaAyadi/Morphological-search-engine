package com.morphologie.api.exception;

import com.morphologie.api.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.validation.FieldError;
import java.util.HashMap;
import java.util.Map;

// ============= Global Exception Handler =============

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // Handle racine not found
    @ExceptionHandler(RacineNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleRacineNotFound(RacineNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Racine not found", ex.getMessage()));
    }
    
    // Handle racine already exists
    @ExceptionHandler(RacineAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleRacineAlreadyExists(RacineAlreadyExistsException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Racine already exists", ex.getMessage()));
    }
    
    // Handle invalid racine
    @ExceptionHandler(InvalidRacineException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidRacine(InvalidRacineException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid racine", ex.getMessage()));
    }
    
    // Handle scheme not found
    @ExceptionHandler(SchemeNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleSchemeNotFound(SchemeNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Scheme not found", ex.getMessage()));
    }
    
    // Handle scheme already exists
    @ExceptionHandler(SchemeAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleSchemeAlreadyExists(SchemeAlreadyExistsException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Scheme already exists", ex.getMessage()));
    }
    
    // Handle invalid scheme
    @ExceptionHandler(InvalidSchemeException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidScheme(InvalidSchemeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid scheme", ex.getMessage()));
    }
    
    // Handle word generation failed
    @ExceptionHandler(WordGenerationException.class)
    public ResponseEntity<ApiResponse<Void>> handleWordGenerationFailed(WordGenerationException ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Word generation failed", ex.getMessage()));
    }
    
    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", errors.toString()));
    }
    
    // Handle generic exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An error occurred", ex.getMessage()));
    }
}