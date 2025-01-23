package com.example.Category;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    private final Map<String, Category> categories = new ConcurrentHashMap<>();

    @GetMapping("/{id}")
    public EntityModel<Category> getCategory(@PathVariable String id) {
        Category category = categories.get(id);
        if (category == null) {
            throw new CategoryNotFoundException(id);
        }
        return EntityModel.of(category,
            linkTo(methodOn(CategoryController.class).getCategory(id)).withSelfRel(),
            linkTo(methodOn(CategoryController.class).getAllCategories(category.getUserId())).withRel("user-categories"));
    }

    @GetMapping
    public CollectionModel<EntityModel<Category>> getAllCategories(@RequestParam String userId) {
        List<EntityModel<Category>> categoryEntities = categories.values().stream()
            .filter(category -> category.getUserId().equals(userId))
            .map(category -> EntityModel.of(category,
                linkTo(methodOn(CategoryController.class).getCategory(category.getId())).withSelfRel()))
            .collect(Collectors.toList());
        return CollectionModel.of(categoryEntities,
            linkTo(methodOn(CategoryController.class).getAllCategories(userId)).withSelfRel());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        category.setId(UUID.randomUUID().toString());
        categories.put(category.getId(), category);
        EntityModel<Category> resource = EntityModel.of(category,
            linkTo(methodOn(CategoryController.class).getCategory(category.getId())).withSelfRel(),
            linkTo(methodOn(CategoryController.class).getAllCategories(category.getUserId())).withRel("user-categories"));
        return ResponseEntity
            .created(linkTo(methodOn(CategoryController.class).getCategory(category.getId())).toUri())
            .body(resource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable String id, @RequestBody Category newCategory) {
        Category category = categories.get(id);
        if (category == null) {
            throw new CategoryNotFoundException(id);
        }
        newCategory.setId(id);
        categories.put(id, newCategory);
        EntityModel<Category> resource = EntityModel.of(newCategory,
            linkTo(methodOn(CategoryController.class).getCategory(id)).withSelfRel(),
            linkTo(methodOn(CategoryController.class).getAllCategories(newCategory.getUserId())).withRel("user-categories"));
        return ResponseEntity.ok(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        if (!categories.containsKey(id)) {
            throw new CategoryNotFoundException(id);
        }
        categories.remove(id);
        return ResponseEntity.noContent().build();
    }
}

@ResponseStatus(HttpStatus.NOT_FOUND)
class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(String id) {
        super("Could not find category " + id);
    }
}