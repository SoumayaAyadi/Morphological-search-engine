package com.morphologie.api.exception;

public class RacineNotFoundException extends RuntimeException {
    
    public RacineNotFoundException(String message) {
        super(message);
    }
    
    public RacineNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}