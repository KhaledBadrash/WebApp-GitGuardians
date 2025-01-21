package com.calendar.user_service;

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
class UserController {
    private final Map<String, User> users = new ConcurrentHashMap<>();

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

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        user.setId(UUID.randomUUID().toString());
        users.put(user.getId(), user);

        EntityModel<User> resource = EntityModel.of(user,
            linkTo(methodOn(UserController.class).getUser(user.getId())).withSelfRel(),
            linkTo(methodOn(UserController.class).getAllUsers()).withRel("all-users"));

        return ResponseEntity
            .created(linkTo(methodOn(UserController.class).getUser(user.getId())).toUri())
            .body(resource);
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!users.containsKey(id)) {
            throw new UserNotFoundException(id);
        }
        users.remove(id);
        return ResponseEntity.noContent().build();
    }
}

@ResponseStatus(HttpStatus.NOT_FOUND)
class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String id) {
        super("Could not find user " + id);
    }
}
