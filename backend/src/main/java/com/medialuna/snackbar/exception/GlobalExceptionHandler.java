package com.medialuna.snackbar.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles all uncaught General Exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        log.error("An unexpected error occurred: ", ex);

        Map<String, String> response = new HashMap<>();
        response.put("error", "Internal Server Error");
        response.put("message",
                ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred processing your request.");

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handlers for more specific exceptions can be added here
     * e.g. @ExceptionHandler(IllegalArgumentException.class)
     */
}
