package com.morphologie.api.exception;


// Scheme already exists exception
public class SchemeAlreadyExistsException extends RuntimeException {
    public SchemeAlreadyExistsException(String scheme) {
        super("Scheme already exists: " + scheme);
    }
}