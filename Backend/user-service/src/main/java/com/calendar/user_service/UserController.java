package com.calendar.user_service;

import lombok.Data;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", allowCredentials = "true")
class UserController {
    private final Map<String, User> users = new ConcurrentHashMap<>();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        // Eingabedaten validieren
        if (loginUser.getEmail() == null || loginUser.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Email und Passwort müssen angegeben werden");
        }
    
        // Benutzer anhand der E-Mail suchen
        User user = users.values().stream()
            .filter(u -> u.getEmail().equals(loginUser.getEmail()))
            .findFirst()
            .orElse(null);
    
        // Benutzer existiert nicht
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Benutzer mit dieser E-Mail wurde nicht gefunden");
        }
    
        // Passwortprüfung
        if (!user.getPassword().equals(loginUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Das eingegebene Passwort ist falsch");
        }
    
        // Erfolgreiche Authentifizierung
        String token = UUID.randomUUID().toString(); // Dummy-Token
        return ResponseEntity.ok(EntityModel.of(user,
            linkTo(methodOn(UserController.class).getUser(user.getId())).withSelfRel())
            .add(linkTo(methodOn(UserController.class).getAllUsers()).withRel("all-users")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        boolean emailExists = users.values().stream()
            .anyMatch(u -> u.getEmail().equals(user.getEmail()));

        if (emailExists) {
            return ResponseEntity.badRequest().body("Email bereits registriert");
        }

        user.setId(UUID.randomUUID().toString());
        users.put(user.getId(), user);

        return ResponseEntity.ok(EntityModel.of(user,
            linkTo(methodOn(UserController.class).getUser(user.getId())).withSelfRel()));
    }

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
     * Benutzer aktualisieren
     * Aktualisiert einen vorhandenen Benutzer mit neuen Daten.
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
     * Benutzer löschen
     * Entfernt einen Benutzer anhand der ID.
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
 * Benutzer-Datenklasse
 * Repräsentiert die Benutzerdaten mit ID, E-Mail, Name und Passwort.
 */
@Data
class User {
    private String id;
    private String email;
    private String name;
    private String password;
}

/**
 * Benutzer nicht gefunden Ausnahme
 * Wird geworfen, wenn ein Benutzer mit einer bestimmten ID nicht existiert.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String id) {
        super("Could not find user " + id);
    }
}

