package com.calendar.user_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
* Main class of user service application.
* This class starts the Spring Boot application.
*/
@SpringBootApplication
public class UserServiceApplication {
    
    /**
* Application entry point.
* The Spring Boot application is initialized and started here.
*/
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
