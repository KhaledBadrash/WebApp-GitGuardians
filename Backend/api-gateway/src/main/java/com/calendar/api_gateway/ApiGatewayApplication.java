package com.calendar.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*"); // Development: Allow all origins
        config.addAllowedHeader("*");
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("PATCH");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}

@RestController
@RequestMapping("/api/users")
class GatewayHateoasController {

    private final Map<Long, User> userStorage = new ConcurrentHashMap<>();
    private long userIdSequence = 1;

    @GetMapping("/{id}")
    public EntityModel<User> getUser(@PathVariable Long id) {
        User user = userStorage.get(id);
        if (user == null) {
            throw new NoSuchElementException("User not found with ID: " + id);
        }

        Link selfLink = WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(GatewayHateoasController.class).getUser(id)).withSelfRel();
        Link updateLink = WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(GatewayHateoasController.class).updateUser(id, user)).withRel("update").withType("PUT");
        Link todosLink = WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(GatewayHateoasController.class).getTodosByUser(id)).withRel("todos");

        return EntityModel.of(user, selfLink, updateLink, todosLink);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setId(userIdSequence++);
        userStorage.put(user.getId(), user);
        return user;
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User existingUser = userStorage.get(id);
        if (existingUser == null) {
            throw new NoSuchElementException("User not found with ID: " + id);
        }
        updatedUser.setId(id);
        userStorage.put(id, updatedUser);
        return updatedUser;
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        if (!userStorage.containsKey(id)) {
            throw new NoSuchElementException("User not found with ID: " + id);
        }
        userStorage.remove(id);
        return "User with ID " + id + " deleted.";
    }

    @GetMapping("/{id}/todos")
    public List<String> getTodosByUser(@PathVariable Long id) {
        if (!userStorage.containsKey(id)) {
            throw new NoSuchElementException("User not found with ID: " + id);
        }
        return Arrays.asList("Todo 1 for user " + id, "Todo 2 for user " + id);
    }
}

class User {
    private Long id;
    private String name;
    private String email;

    public User() {}

    public User(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
