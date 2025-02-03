package com.calendar.user_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Hauptklasse der Benutzer-Service-Anwendung.
 * Diese Klasse startet die Spring Boot Anwendung.
 */
@SpringBootApplication
public class UserServiceApplication {
    
    /**
     * Einstiegspunkt der Anwendung.
     * Die Spring Boot Anwendung wird hier initialisiert und gestartet.
     */
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
