package com.calendar.todo_service;

import lombok.Data;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

/**
 * REST controller for Todo management.
 * Supports CRUD operations and HATEOAS links.
 */
@RestController
@RequestMapping("/api/todos")
public class TodoController {

    // In-memory storage for todos
    private final Map<String, Todo> todos = new ConcurrentHashMap<>();

    /**
     * GET /api/todos/{id}
     * Returns a single todo based on the ID.
     *
     * @param id The ID of the requested todo.
     * @return The todo with HATEOAS links.
     */
    @GetMapping("/{id}")
    public EntityModel<Todo> getTodo(@PathVariable String id) {
        Todo todo = todos.get(id);
        if (todo == null) {
            throw new TodoNotFoundException(id);
        }

        // Return the todo with links to other relevant resources
        return EntityModel.of(todo,
            linkTo(methodOn(TodoController.class).getTodo(id)).withSelfRel(),
            linkTo(methodOn(TodoController.class).getAllTodos(todo.getUserId())).withRel("user-todos"),
            linkTo(methodOn(TodoController.class).toggleTodo(id)).withRel("toggle")
        );
    }

    /**
     * GET /api/todos?userId={userId}
     * Returns all todos of a user.
     *
     * @param userId The ID of the user whose todos should be retrieved.
     * @return A collection of todos with HATEOAS links.
     */
    @GetMapping
    public CollectionModel<EntityModel<Todo>> getAllTodos(@RequestParam String userId) {
        List<EntityModel<Todo>> todoEntities = todos.values().stream()
            .filter(todo -> todo.getUserId().equals(userId)) // Filter by user ID
            .map(todo -> EntityModel.of(todo,
                linkTo(methodOn(TodoController.class).getTodo(todo.getId())).withSelfRel(),
                linkTo(methodOn(TodoController.class).toggleTodo(todo.getId())).withRel("toggle")))
            .collect(Collectors.toList());

        // Return the user's todos
        return CollectionModel.of(todoEntities,
            linkTo(methodOn(TodoController.class).getAllTodos(userId)).withSelfRel());
    }

    /**
     * POST /api/todos
     * Creates a new todo.
     *
     * @param todo The data of the todo to be created in the request body.
     * @return The created todo with HATEOAS links.
     */
    @PostMapping
    public ResponseEntity<?> createTodo(@RequestBody Todo todo) {
        todo.setId(UUID.randomUUID().toString());
        todo.setCompleted(false); // Default status: not completed

        // Validate input data
        if (todo.getTitle() == null || todo.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Title is required");
        }
        if (todo.getUserId() == null || todo.getUserId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("UserId is required");
        }
        if (todo.getDescription() == null) {
            todo.setDescription(""); // Default empty description
        }

        todos.put(todo.getId(), todo);

        // Return the created todo
        EntityModel<Todo> resource = EntityModel.of(todo,
            linkTo(methodOn(TodoController.class).getTodo(todo.getId())).withSelfRel(),
            linkTo(methodOn(TodoController.class).getAllTodos(todo.getUserId())).withRel("user-todos"),
            linkTo(methodOn(TodoController.class).toggleTodo(todo.getId())).withRel("toggle")
        );

        return ResponseEntity
            .created(linkTo(methodOn(TodoController.class).getTodo(todo.getId())).toUri())
            .body(resource);
    }

    /**
     * PATCH /api/todos/{id}/toggle
     * Changes the status (completed/not completed) of a todo.
     *
     * @param id The ID of the todo.
     * @return The updated todo with HATEOAS links.
     */
    @PatchMapping("/{id}/toggle")
    public EntityModel<Todo> toggleTodo(@PathVariable String id) {
        Todo todo = todos.get(id);
        if (todo == null) {
            throw new TodoNotFoundException(id);
        }

        // Toggle status
        todo.setCompleted(!todo.isCompleted());
        todos.put(id, todo);

        return EntityModel.of(todo,
            linkTo(methodOn(TodoController.class).getTodo(id)).withSelfRel(),
            linkTo(methodOn(TodoController.class).getAllTodos(todo.getUserId())).withRel("user-todos"),
            linkTo(methodOn(TodoController.class).toggleTodo(id)).withRel("toggle")
        );
    }

    /**
     * DELETE /api/todos/{id}
     * Deletes a todo based on the ID.
     *
     * @param id The ID of the todo to be deleted.
     * @return An empty response on success.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable String id) {
        if (!todos.containsKey(id)) {
            throw new TodoNotFoundException(id);
        }
        todos.remove(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Error handling for non-existent todos.
     *
     * @param ex The triggered exception.
     * @return An error response with status 404.
     */
    @ExceptionHandler(TodoNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleTodoNotFound(TodoNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}

/**
 * Model class for todos.
 */
@Data
class Todo {
    private String id;           // Unique ID of the todo
    private String userId;       // ID of the associated user
    private String title;        // Title of the todo
    private String description;  // Description of the todo
    private boolean completed;   // Status of the todo (completed/not completed)
}

/**
 * Exception for cases where a todo is not found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class TodoNotFoundException extends RuntimeException {
    public TodoNotFoundException(String id) {
        super("Could not find todo " + id);
    }
}
