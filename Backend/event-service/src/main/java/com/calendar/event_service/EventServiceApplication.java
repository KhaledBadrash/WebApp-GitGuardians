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

// Haupt-Anwendungsklasse
@SpringBootApplication
public class EventServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EventServiceApplication.class, args);
    }

    // Registrierung des DateTime-Scalars
    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder.scalar(graphql.scalars.ExtendedScalars.DateTime);
    }
}

// Event-Modellklasse
@Data
class Event {
    private String id;            // Eindeutige ID des Events
    private String title;         // Titel des Events
    private LocalDateTime start;  // Startzeit
    private LocalDateTime end;    // Endzeit
    private String userId;        // ID des Benutzers, der das Event erstellt hat
    private Priority priority;    // Priorität des Events
    private String categoryId;    // ID der Kategorie (optional)
}

// Enum für Prioritäten
enum Priority {
    HIGH, MEDIUM, LOW
}

// GraphQL-Controller für Events
@Controller
class EventController {
    private final Map<String, Event> events = new ConcurrentHashMap<>();

    // Mutation: Neues Event erstellen
    @MutationMapping
    public Event createEvent(
            @Argument String title,
            @Argument LocalDateTime start,
            @Argument LocalDateTime end,
            @Argument String userId,
            @Argument Priority priority,
            @Argument String categoryId) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Startzeit darf nicht nach der Endzeit liegen.");
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

    // Query: Event anhand der ID abrufen
    @QueryMapping
    public Event event(@Argument String id) {
        return Optional.ofNullable(events.get(id))
                .orElseThrow(() -> new NoSuchElementException("Event mit der angegebenen ID wurde nicht gefunden."));
    }

    // Query: Alle Events eines bestimmten Benutzers abrufen
    @QueryMapping
    public List<Event> eventsByUser(@Argument String userId) {
        return events.values().stream()
                .filter(event -> event.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    // Query: Events in einem bestimmten Zeitraum abrufen
    @QueryMapping
    public List<Event> eventsByDateRange(@Argument LocalDateTime start, @Argument LocalDateTime end) {
        return events.values().stream()
                .filter(event -> !event.getStart().isBefore(start) && !event.getEnd().isAfter(end))
                .collect(Collectors.toList());
    }

    // Mutation: Event aktualisieren
    @MutationMapping
    public Event updateEvent(
            @Argument String id,
            @Argument String title,
            @Argument LocalDateTime start,
            @Argument LocalDateTime end,
            @Argument Priority priority,
            @Argument String categoryId) {
        Event event = Optional.ofNullable(events.get(id))
                .orElseThrow(() -> new NoSuchElementException("Event mit der angegebenen ID wurde nicht gefunden."));

        if (title != null) event.setTitle(title);
        if (start != null) event.setStart(start);
        if (end != null) event.setEnd(end);
        if (priority != null) event.setPriority(priority);
        if (categoryId != null) event.setCategoryId(categoryId);
        return event;
    }

    // Mutation: Event löschen
    @MutationMapping
    public boolean deleteEvent(@Argument String id) {
        return events.remove(id) != null;
    }
}
