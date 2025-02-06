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
 * REST-Controller für das Todo-Management.
 * Unterstützt CRUD-Operationen und HATEOAS-Links.
 */
@RestController
@RequestMapping("/api/todos")
public class TodoController {

    // In-Memory-Speicher für Todos
    private final Map<String, Todo> todos = new ConcurrentHashMap<>();

    /**
     * GET /api/todos/{id}
     * Gibt ein einzelnes Todo zurück, basierend auf der ID.
     *
     * @param id Die ID des gewünschten Todos.
     * @return Das Todo mit HATEOAS-Links.
     */
    @GetMapping("/{id}")
    public EntityModel<Todo> getTodo(@PathVariable String id) {
        Todo todo = todos.get(id);
        if (todo == null) {
            throw new TodoNotFoundException(id);
        }

        // Rückgabe des Todos mit Links zu weiteren relevanten Ressourcen
        return EntityModel.of(todo,
            linkTo(methodOn(TodoController.class).getTodo(id)).withSelfRel(),
            linkTo(methodOn(TodoController.class).getAllTodos(todo.getUserId())).withRel("user-todos"),
            linkTo(methodOn(TodoController.class).toggleTodo(id)).withRel("toggle")
        );
    }

    /**
     * GET /api/todos?userId={userId}
     * Gibt alle Todos eines Benutzers zurück.
     *
     * @param userId Die ID des Benutzers, dessen Todos abgerufen werden sollen.
     * @return Eine Sammlung von Todos mit HATEOAS-Links.
     */
    @GetMapping
    public CollectionModel<EntityModel<Todo>> getAllTodos(@RequestParam String userId) {
        List<EntityModel<Todo>> todoEntities = todos.values().stream()
            .filter(todo -> todo.getUserId().equals(userId)) // Filtere nach Benutzer-ID
            .map(todo -> EntityModel.of(todo,
                linkTo(methodOn(TodoController.class).getTodo(todo.getId())).withSelfRel(),
                linkTo(methodOn(TodoController.class).toggleTodo(todo.getId())).withRel("toggle")))
            .collect(Collectors.toList());

        // Rückgabe der Todos des Benutzers
        return CollectionModel.of(todoEntities,
            linkTo(methodOn(TodoController.class).getAllTodos(userId)).withSelfRel());
    }

    /**
     * POST /api/todos
     * Erstellt ein neues Todo.
     *
     * @param todo Die Daten des zu erstellenden Todos im Request-Body.
     * @return Das erstellte Todo mit HATEOAS-Links.
     */
    @PostMapping
    public ResponseEntity<?> createTodo(@RequestBody Todo todo) {
        todo.setId(UUID.randomUUID().toString());
        todo.setCompleted(false); // Standardstatus: nicht abgeschlossen

        // Validierung der Eingabedaten
        if (todo.getTitle() == null || todo.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Title is required");
        }
        if (todo.getUserId() == null || todo.getUserId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("UserId is required");
        }
        if (todo.getDescription() == null) {
            todo.setDescription(""); // Standard leere Beschreibung
        }

        todos.put(todo.getId(), todo);

        // Rückgabe des erstellten Todos
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
     * Ändert den Status (abgeschlossen/nicht abgeschlossen) eines Todos.
     *
     * @param id Die ID des Todos.
     * @return Das aktualisierte Todo mit HATEOAS-Links.
     */
    @PatchMapping("/{id}/toggle")
    public EntityModel<Todo> toggleTodo(@PathVariable String id) {
        Todo todo = todos.get(id);
        if (todo == null) {
            throw new TodoNotFoundException(id);
        }

        // Status umschalten
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
     * Löscht ein Todo basierend auf der ID.
     *
     * @param id Die ID des zu löschenden Todos.
     * @return Eine leere Antwort bei Erfolg.
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
     * Fehlerbehandlung für nicht gefundene Todos.
     *
     * @param ex Die ausgelöste Exception.
     * @return Eine Fehlerantwort mit dem Status 404.
     */
    @ExceptionHandler(TodoNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleTodoNotFound(TodoNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}

/**
 * Modellklasse für Todos.
 */
@Data
class Todo {
    private String id;           // Eindeutige ID des Todos
    private String userId;       // ID des zugehörigen Benutzers
    private String title;        // Titel des Todos
    private String description;  // Beschreibung des Todos
    private boolean completed;   // Status des Todos (abgeschlossen/nicht abgeschlossen)
}

/**
 * Exception für den Fall, dass ein Todo nicht gefunden wird.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class TodoNotFoundException extends RuntimeException {
    public TodoNotFoundException(String id) {
        super("Could not find todo " + id);
    }
}
 