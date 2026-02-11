package com.morphologie.api.exception;



// Word generation failed exception
public class WordGenerationException extends RuntimeException {
    public WordGenerationException(String message) {
        super(message);
    }
}