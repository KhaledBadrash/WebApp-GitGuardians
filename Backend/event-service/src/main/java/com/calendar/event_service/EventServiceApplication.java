package com.calendar.event_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
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
}

// Event-Modellklasse
@Data
class Event {
    private String id;
    private String title;
    private LocalDateTime start;
    private LocalDateTime end;
    private String userId;
    private Priority priority;
    private String categoryId;
}

// Prioritäts-Enum
enum Priority {
    HIGH, MEDIUM, LOW
}

// Event-Controller für GraphQL-Anfragen
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
            @Argument Priority priority) {
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
        events.put(event.getId(), event);
        return event;
    }

    // Query: Event anhand der ID abrufen
    @QueryMapping
    public Event event(@Argument String id) {
        return Optional.ofNullable(events.get(id))
                .orElseThrow(() -> new NoSuchElementException("Event mit der angegebenen ID wurde nicht gefunden."));
    }

    // Query: Events eines bestimmten Benutzers abrufen
    @QueryMapping
    public List<Event> eventsByUser(@Argument String userId) {
        return events.values().stream()
                .filter(event -> event.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    // Query: Events innerhalb eines Zeitraums abrufen
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
            @Argument Priority priority) {
        Event event = Optional.ofNullable(events.get(id))
                .orElseThrow(() -> new NoSuchElementException("Event mit der angegebenen ID wurde nicht gefunden."));

        if (title != null) event.setTitle(title);
        if (start != null) event.setStart(start);
        if (end != null) event.setEnd(end);
        if (priority != null) event.setPriority(priority);
        return event;
    }

    // Mutation: Event löschen
    @MutationMapping
    public boolean deleteEvent(@Argument String id) {
        return events.remove(id) != null;
    }
}
