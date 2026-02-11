package com.morphologie.api.exception;



// Racine not found exception
public class RacineNotFoundException extends RuntimeException {
    public RacineNotFoundException(String racine) {
        super("Racine not found: " + racine);
    }
}