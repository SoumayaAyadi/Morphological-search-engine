package com.morphologie.api.exception;


// Scheme not found exception
public class SchemeNotFoundException extends RuntimeException {
    public SchemeNotFoundException(String scheme) {
        super("Scheme not found: " + scheme);
    }
}