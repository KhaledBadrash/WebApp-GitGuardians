package com.calendar.event_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.stereotype.Controller;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

// Main application class
@SpringBootApplication
public class EventServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EventServiceApplication.class, args);
    }

    // Registering the DateTime scalar
    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder.scalar(graphql.scalars.ExtendedScalars.DateTime);
    }
}

// Event model class
@Data
class Event {
    private String id;            // Unique ID of the event
    private String title;         // Title of the event
    private LocalDateTime start;  // Start time
    private LocalDateTime end;    // End time
    private String userId;        // ID of the user who created the event
    private Priority priority;    // Priority of the event
    private String categoryId;    // ID of the category (optional)
}

// Enum for priorities
enum Priority {
    HIGH, MEDIUM, LOW
}

// GraphQL controller for events
@Controller
class EventController {
    private final Map<String, Event> events = new ConcurrentHashMap<>();

    // Mutation: Create a new event
    @MutationMapping
    public Event createEvent(
            @Argument String title,
            @Argument LocalDateTime start,
            @Argument LocalDateTime end,
            @Argument String userId,
            @Argument Priority priority,
            @Argument String categoryId) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Start time cannot be after the end time.");
        }

        Event event = new Event();
        event.setId(UUID.randomUUID().toString());
        event.setTitle(title);
        event.setStart(start);
        event.setEnd(end);
        event.setUserId(userId);
        event.setPriority(priority);
        event.setCategoryId(categoryId);
        events.put(event.getId(), event);
        return event;
    }

    // Query: Retrieve an event by ID
    @QueryMapping
    public Event event(@Argument String id) {
        return Optional.ofNullable(events.get(id))
                .orElseThrow(() -> new NoSuchElementException("Event with the specified ID was not found."));
    }

    // Query: Retrieve all events for a specific user
    @QueryMapping
    public List<Event> eventsByUser(@Argument String userId) {
        return events.values().stream()
                .filter(event -> event.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    // Query: Retrieve events within a specific time range
    @QueryMapping
    public List<Event> eventsByDateRange(@Argument LocalDateTime start, @Argument LocalDateTime end) {
        return events.values().stream()
                .filter(event -> !event.getStart().isBefore(start) && !event.getEnd().isAfter(end))
                .collect(Collectors.toList());
    }

    // Mutation: Update an event
    @MutationMapping
    public Event updateEvent(
            @Argument String id,
            @Argument String title,
            @Argument LocalDateTime start,
            @Argument LocalDateTime end,
            @Argument Priority priority,
            @Argument String categoryId) {
        Event event = Optional.ofNullable(events.get(id))
                .orElseThrow(() -> new NoSuchElementException("Event with the specified ID was not found."));

        if (title != null) event.setTitle(title);
        if (start != null) event.setStart(start);
        if (end != null) event.setEnd(end);
        if (priority != null) event.setPriority(priority);
        if (categoryId != null) event.setCategoryId(categoryId);
        return event;
    }

    // Mutation: Delete an event
    @MutationMapping
    public boolean deleteEvent(@Argument String id) {
        return events.remove(id) != null;
    }
}

