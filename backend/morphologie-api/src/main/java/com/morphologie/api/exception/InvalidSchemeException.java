package com.morphologie.api.exception;


// Invalid scheme exception
public class InvalidSchemeException extends RuntimeException {
    public InvalidSchemeException(String message) {
        super(message);
    }
}