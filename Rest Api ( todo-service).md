## REST API Todo-Service

### Einführung

Der Todo-Service ist eine moderne REST-API, die eine einfache und dennoch effektive Verwaltung von Aufgaben (Todos) ermöglicht. Sie wurde entwickelt, um Nutzern eine komfortable Möglichkeit zu bieten, ihre Todos zu erfassen, zu organisieren und bei Bedarf zu aktualisieren. Durch den Einsatz von Spring Boot und einer hypermedialen Architektur (HATEOAS) folgt die API gängigen REST-Prinzipien und sorgt für eine intuitive Bedienbarkeit.

Die Datenhaltung erfolgt temporär in einem In-Memory-Speicher, wodurch die API besonders für Entwicklungs- und Testzwecke geeignet ist. In einem produktiven Einsatzszenario wäre eine Verbindung zu einer persistenten Datenbank erforderlich, um langfristige Speicherung und Skalierbarkeit zu gewährleisten.

Die API stellt wesentliche CRUD-Funktionalitäten bereit, darunter das Anlegen, Abrufen, Bearbeiten und Löschen von Todos. Zudem bietet sie eine Funktion zur Statusänderung, mit der Aufgaben als erledigt oder offen markiert werden können. Die Einbettung von Navigationslinks erleichtert die Interaktion mit der API und verbessert die Benutzerfreundlichkeit für Clients erheblich.



## Funktionsweise der Rest API

Der **Todo-Service** basiert auf einer klassischen **Client-Server-Architektur**. Das bedeutet, dass verschiedene Clients, mit dem Server über **HTTP-Anfragen** kommunizieren, um Todos zu **erstellen**, **abzurufen**, **zu aktualisieren** oder **zu löschen**.

Die API folgt den **REST-Prinzipien**, wodurch jede Ressource über eine **eindeutige URL** erreichbar ist. Die Kommunikation erfolgt über die gängigen **HTTP-Methoden**:

###Datenmodell – Aufbau der Todo-Controller-Klasse
**Attribute:**
```
@Data
class Todo {
    private String id;           // Eindeutige ID des Todos
    private String userId;       // ID des zugehörigen Benutzers
    private String title;        // Titel des Todos
    private String description;  // Beschreibung des Todos
    private boolean completed;   // Status des Todos (abgeschlossen/nicht abgeschlossen)
}
```
-Jedes Todo besteht aus einer ID, einem Titel, einer Beschreibung, einem Status und einer Benutzer-ID.

-Die @Data-Annotation von Lombok sorgt dafür, dass Getter/Setter automatisch generiert werden

**Datenspeicherung:**
```
private final Map<String, Todo> todos = new ConcurrentHashMap<>();
```

-Die Datenspeicherung findet hier statt

```

╔═════════════╤════════════════════════════════════════════════════════════════════════════════════════╗
║ Methode     │ Bedeutung                                                                            ║
╠═════════════╪════════════════════════════════════════════════════════════════════════════════════════╣
║ 🟢 GET      │ Ruft eine oder mehrere Aufgaben (Todos) ab                                          ║
║             │ ```java                                                                             ║
║             │ @GetMapping("/{id}")                                                                ║
║             │ public EntityModel<Todo> getTodo(@PathVariable String id) {                        ║
║             │     Todo todo = todos.get(id);                                                     ║
║             │     if (todo == null) throw new TodoNotFoundException(id);                         ║
║             │     return EntityModel.of(todo);                                                   ║
║             │ }                                                                                  ║
║             │ ```                                                                                ║
╠═════════════╪════════════════════════════════════════════════════════════════════════════════════════╣
║ 🟡 POST     │ Erstellt ein neues Todo                                                             ║
║             │ ```java                                                                             ║
║             │ @PostMapping                                                                       ║
║             │ public ResponseEntity<?> createTodo(@RequestBody Todo todo) {                     ║
║             │     todo.setId(UUID.randomUUID().toString());                                      ║
║             │     todos.put(todo.getId(), todo);                                                ║
║             │     return ResponseEntity.ok(todo);                                               ║
║             │ }                                                                                  ║
║             │ ```                                                                                ║
╠═════════════╪════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔵 PATCH    │ Aktualisiert ein vorhandenes Todo, z. B. den Status                                ║
║             │ ```java                                                                             ║
║             │ @PatchMapping("/{id}/toggle")                                                     ║
║             │ public EntityModel<Todo> toggleTodo(@PathVariable String id) {                    ║
║             │     Todo todo = todos.get(id);                                                     ║
║             │     if (todo == null) throw new TodoNotFoundException(id);                         ║
║             │     todo.setCompleted(!todo.isCompleted());                                       ║
║             │     return EntityModel.of(todo);                                                  ║
║             │ }                                                                                  ║
║             │ ```                                                                                ║
╠═════════════╪════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔴 DELETE   │ Entfernt ein Todo aus der Liste                                                    ║
║             │ ```java                                                                             ║
║             │ @DeleteMapping("/{id}")                                                           ║
║             │ public ResponseEntity<?> deleteTodo(@PathVariable String id) {                    ║
║             │     if (!todos.containsKey(id)) throw new TodoNotFoundException(id);              ║
║             │     todos.remove(id);                                                             ║
║             │     return ResponseEntity.noContent().build();                                   ║
║             │ }                                                                                  ║
║             │ ```                                                                                ║
╚═════════════╧════════════════════════════════════════════════════════════════════════════════════════╝

```


### Fehlerbehandlung und Exceptions

Die API verwendet eine zentrale Fehlerbehandlung, um strukturierte und verständliche Fehlermeldungen zurückzugeben.

**Beispiel: TodoNotFoundException**
```
@ResponseStatus(HttpStatus.NOT_FOUND)
class TodoNotFoundException extends RuntimeException {
    public TodoNotFoundException(String id) {
        super("Could not find todo " + id);
```
Erklärung:

-Diese Exception wird ausgelöst, wenn ein Todo mit der angegebenen ID nicht existiert.

-Die Annotation @ResponseStatus(HttpStatus.NOT_FOUND) sorgt dafür, dass der Client eine 404 Not Found-Antwort erhält.

**Beispiel: Zentrale Fehlerbehandlung**
```
@ExceptionHandler(TodoNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleTodoNotFound(TodoNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
```
Erklärung:

-Diese Methode fängt die TodoNotFoundException global ab.

-Statt eines generischen Serverfehlers erhält der Client eine benutzerfreundliche Fehlermeldung.

-Diese Struktur stellt sicher, dass die API verständliche und standardisierte Fehlerantworten liefert.
### **Zusammenfassung**

Die **Todo-Service API** ist eine REST-basierte Schnittstelle zur Verwaltung von Aufgaben (Todos) und bietet grundlegende CRUD-Funktionalitäten. Über verschiedene Endpunkte können Todos erstellt, abgerufen, aktualisiert und gelöscht werden. Dabei folgt die API den REST-Prinzipien und stellt sicher, dass jede Ressource über eine eindeutige URL erreichbar ist.

Die Datenhaltung erfolgt derzeit in einer **In-Memory `ConcurrentHashMap`**, wodurch die Todos nur während der Laufzeit der Anwendung verfügbar sind. Die API verfügt über eine **zentrale Fehlerbehandlung**, die sicherstellt, dass nicht gefundene Todos mit einer `TodoNotFoundException` abgefangen werden und eine klare `404 Not Found`-Antwort zurückgegeben wird.

Zur besseren Nutzung der API sind HATEOAS-Links in den Antworten integriert, wodurch Clients eine intuitive Navigation zwischen den verfügbaren Aktionen erhalten. Neben der Verwaltung einzelner Todos ermöglicht die API auch das Abrufen aller Todos eines bestimmten Nutzers und das Umschalten des Status zwischen „offen“ und „abgeschlossen“.

Die Todo-Service API bietet eine solide Basis für Aufgabenmanagement und kann flexibel erweitert werden, beispielsweise durch eine Anbindung an eine persistente Datenbank oder zusätzliche Funktionen.
