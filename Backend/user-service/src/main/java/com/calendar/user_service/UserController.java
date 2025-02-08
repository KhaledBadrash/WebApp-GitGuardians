package com.calendar.user_service;

import lombok.Data;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

// This class is a Spring REST controller that implements user management
@RestController
    @RequestMapping("/api/users")
    class UserController {
    
    // A thread-safe map for storing user data
    private final Map<String, User> users = new ConcurrentHashMap<>();

    /**
     * Login method
     * Checks whether the login credentials are correct and returns a token.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        if (loginUser.getEmail() == null || loginUser.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap("message", "E-Mail und Passwort müssen angegeben werden"));
        }

        User user = users.values().stream()
            .filter(u -> u.getEmail().equals(loginUser.getEmail()))
            .findFirst()
            .orElse(null);

            // Einheitliche Fehlermeldung für falsche E-Mail oder falsches Passwort
        if (user == null || !user.getPassword().equals(loginUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "E-Mail oder Passwort ist falsch"));
        }

        String token = UUID.randomUUID().toString();
        return ResponseEntity.ok(EntityModel.of(user,
            linkTo(methodOn(UserController.class).getUser(user.getId())).withSelfRel())
            .add(linkTo(methodOn(UserController.class).getAllUsers()).withRel("all-users")));
    }


    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getName() == null || user.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("All fields (Email, Name, Password) must be filled");
        }
    
        boolean emailExists = users.values().stream()
            .anyMatch(u -> u.getEmail().equals(user.getEmail()));
    
        if (emailExists) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Collections.singletonMap("message", "E-Mail-Account existiert bereits"));
        }

    
        // Generate and store user ID
        user.setId(UUID.randomUUID().toString());
        users.put(user.getId(), user);

        if (user.getEmail() == null || user.getName() == null || user.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap("message", "All fields (Email, Name, Password) must be filled"));
        }

        if (emailExists) {
            return ResponseEntity.badRequest()
                .body(Collections.singletonMap("message", "Email already registered"));
        }
    
        return ResponseEntity.ok(EntityModel.of(user,
            linkTo(methodOn(UserController.class).getUser(user.getId())).withSelfRel()));
    }

    /**
     * Retrieve user
     * Returns a user based on the ID.
     */
    @GetMapping("/{id}")
    public EntityModel<User> getUser(@PathVariable String id) {
        User user = users.get(id);
        if (user == null) {
            throw new UserNotFoundException(id);
        }

        return EntityModel.of(user,
            linkTo(methodOn(UserController.class).getUser(id)).withSelfRel(),
            linkTo(methodOn(UserController.class).getAllUsers()).withRel("all-users")
        );
    }

    /**
     * Retrieve all users
     * Returns a list of all stored users.
     */
    @GetMapping
    public CollectionModel<EntityModel<User>> getAllUsers() {
        List<EntityModel<User>> userEntities = users.values().stream()
            .map(user -> EntityModel.of(user,
                linkTo(methodOn(UserController.class).getUser(user.getId())).withSelfRel()))
            .collect(Collectors.toList());

        return CollectionModel.of(userEntities,
            linkTo(methodOn(UserController.class).getAllUsers()).withSelfRel());
    }

    /**
     * Update user
     * Updates an existing user with new data.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User newUser) {
        User user = users.get(id);
        if (user == null) {
            throw new UserNotFoundException(id);
        }

        newUser.setId(id);
        users.put(id, newUser);

        EntityModel<User> resource = EntityModel.of(newUser,
            linkTo(methodOn(UserController.class).getUser(id)).withSelfRel(),
            linkTo(methodOn(UserController.class).getAllUsers()).withRel("all-users"));

        return ResponseEntity.ok(resource);
    }

    /**
     * Delete user
     * Removes a user based on the ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!users.containsKey(id)) {
            throw new UserNotFoundException(id);
        }
        users.remove(id);
        return ResponseEntity.noContent().build();
    }
}

/**
 * User data class
 * Represents user data with ID, email, name, and password.
 */
@Data
class User {
    private String id;
    private String email;
    private String name;
    private String password;
}

/**
 * User not found exception
 * Thrown when a user with a specific ID does not exist.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String id) {
        super("Could not find user " + id);
    }
}
