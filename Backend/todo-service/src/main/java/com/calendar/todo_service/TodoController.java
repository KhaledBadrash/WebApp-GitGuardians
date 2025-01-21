package com.calendar.todo_service;

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

@RestController
@RequestMapping("/api/todos")
class TodoController {
    private final Map<String, Todo> todos = new ConcurrentHashMap<>();

    @GetMapping("/{id}")
    public EntityModel<Todo> getTodo(@PathVariable String id) {
        Todo todo = todos.get(id);
        if (todo == null) {
            throw new TodoNotFoundException(id);
        }

        return EntityModel.of(todo,
            linkTo(methodOn(TodoController.class).getTodo(id)).withSelfRel(),
            linkTo(methodOn(TodoController.class).getAllTodos(todo.getUserId())).withRel("user-todos"),
            linkTo(methodOn(TodoController.class).toggleTodo(id)).withRel("toggle")
        );
    }

    @GetMapping
    public CollectionModel<EntityModel<Todo>> getAllTodos(@RequestParam String userId) {
        List<EntityModel<Todo>> todoEntities = todos.values().stream()
            .filter(todo -> todo.getUserId().equals(userId))
            .map(todo -> EntityModel.of(todo,
                linkTo(methodOn(TodoController.class).getTodo(todo.getId())).withSelfRel(),
                linkTo(methodOn(TodoController.class).toggleTodo(todo.getId())).withRel("toggle")))
            .collect(Collectors.toList());

        return CollectionModel.of(todoEntities,
            linkTo(methodOn(TodoController.class).getAllTodos(userId)).withSelfRel());
    }

    @PostMapping
    public ResponseEntity<?> createTodo(@RequestBody Todo todo) {
        todo.setId(UUID.randomUUID().toString());
        todo.setCompleted(false);
        todos.put(todo.getId(), todo);

        EntityModel<Todo> resource = EntityModel.of(todo,
            linkTo(methodOn(TodoController.class).getTodo(todo.getId())).withSelfRel(),
            linkTo(methodOn(TodoController.class).getAllTodos(todo.getUserId())).withRel("user-todos"),
            linkTo(methodOn(TodoController.class).toggleTodo(todo.getId())).withRel("toggle")
        );

        return ResponseEntity
            .created(linkTo(methodOn(TodoController.class).getTodo(todo.getId())).toUri())
            .body(resource);
    }

    @PatchMapping("/{id}/toggle")
    public EntityModel<Todo> toggleTodo(@PathVariable String id) {
        Todo todo = todos.get(id);
        if (todo == null) {
            throw new TodoNotFoundException(id);
        }

        todo.setCompleted(!todo.isCompleted());
        todos.put(id, todo);

        return EntityModel.of(todo,
            linkTo(methodOn(TodoController.class).getTodo(id)).withSelfRel(),
            linkTo(methodOn(TodoController.class).getAllTodos(todo.getUserId())).withRel("user-todos")
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable String id) {
        if (!todos.containsKey(id)) {
            throw new TodoNotFoundException(id);
        }
        todos.remove(id);
        return ResponseEntity.noContent().build();
    }
}

@ResponseStatus(HttpStatus.NOT_FOUND)
class TodoNotFoundException extends RuntimeException {
    public TodoNotFoundException(String id) {
        super("Could not find todo " + id);
    }
}
