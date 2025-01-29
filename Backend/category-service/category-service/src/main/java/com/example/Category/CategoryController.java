package com.example.Category;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.CollectionModel;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final Map<Integer, Category> categories = new ConcurrentHashMap<>();
    private final AtomicInteger idGenerator = new AtomicInteger(1); // ID-Generator

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<Category>> getCategory(@PathVariable int id) {
        Category category = categories.get(id);
        if (category == null) {
            throw new CategoryNotFoundException(id);
        }
        return ResponseEntity.ok(EntityModel.of(category,
            linkTo(methodOn(CategoryController.class).getCategory(id)).withSelfRel(),
            linkTo(methodOn(CategoryController.class).getAllCategories(category.getUserId())).withRel("user-categories")));
    }

    @GetMapping
    public CollectionModel<EntityModel<Category>> getAllCategories(@RequestParam int userId) {
        List<EntityModel<Category>> categoryEntities = categories.values().stream()
            .filter(category -> category.getUserId() == userId)
            .map(category -> EntityModel.of(category,
                linkTo(methodOn(CategoryController.class).getCategory(category.getId())).withSelfRel()))
            .collect(Collectors.toList());
        return CollectionModel.of(categoryEntities,
            linkTo(methodOn(CategoryController.class).getAllCategories(userId)).withSelfRel());
    }

    @PostMapping
    public ResponseEntity<EntityModel<Category>> createCategory(@RequestBody Category category) {
        return saveCategory(category, null); // Falls keine ID vorhanden ist -> neue Kategorie erstellen
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<Category>> updateCategory(@PathVariable int id, @RequestBody Category category) {
        return saveCategory(category, id); // Falls ID vorhanden -> Update
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable int id) {
        if (!categories.containsKey(id)) {
            throw new CategoryNotFoundException(id);
        }
        categories.remove(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * *Gemeinsame Methode zum Erstellen und Aktualisieren einer Kategorie*
     * Falls id null ist → Neue Kategorie wird erstellt.  
     * Falls id gesetzt ist → Vorhandene Kategorie wird aktualisiert.  
     */
    public  ResponseEntity<EntityModel<Category>> saveCategory(Category category, Integer id) {
        if (id == null) { // Neue Kategorie erstellen
            category.setId(idGenerator.getAndIncrement());
        } else { // Vorhandene Kategorie aktualisieren
            if (!categories.containsKey(id)) {
                throw new CategoryNotFoundException(id);
            }
            category.setId(id);
        }
        categories.put(category.getId(), category); // Speichern/Aktualisieren

        EntityModel<Category> resource = EntityModel.of(category,
            linkTo(methodOn(CategoryController.class).getCategory(category.getId())).withSelfRel(),
            linkTo(methodOn(CategoryController.class).getAllCategories(category.getUserId())).withRel("user-categories"));

        return id == null
            ? ResponseEntity.created(linkTo(methodOn(CategoryController.class).getCategory(category.getId())).toUri()).body(resource)
            : ResponseEntity.ok(resource);
    }
}

/**
 * *Fehlermeldung für nicht gefundene Kategorien*
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(int id) {
        super("Could not find category with id: " + id);
    }
}
