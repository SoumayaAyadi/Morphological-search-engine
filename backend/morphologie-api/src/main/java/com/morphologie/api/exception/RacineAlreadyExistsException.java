package com.morphologie.api.exception;



// Racine already exists exception
public class RacineAlreadyExistsException extends RuntimeException {
    public RacineAlreadyExistsException(String racine) {
        super("Racine already exists: " + racine);
    }
}