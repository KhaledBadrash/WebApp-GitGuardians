## Einleitung
Unsere Anwendung ist ein webbasierter Terminkalender, der es Benutzern ermöglicht, Termine, Aufgaben und Kategorien effizient zu verwalten. Das System wird zentral durch ein API-Gateway gesteuert. Ziel der Anwendung ist es, eine benutzerfreundliche und skalierbare Lösung anzubieten, die sowohl im Frontend als auch im Backend durchdacht umgesetzt wurde. Die Anwendung soll Benutzern helfen, ihren Alltag besser zu organisieren, indem sie eine zentrale Plattform für die Verwaltung von Terminen, Aufgaben und Kategorien bietet.

Die Architektur der Anwendung basiert auf einem API-Gateway, das als zentraler Einstiegspunkt für alle Anfragen fungiert und diese gezielt an die entsprechenden Microservices weiterleitet. Diese Microservices sind eigenständige Module, die spezifische Aufgaben übernehmen, wie die Verwaltung von Kategorien, Aufgaben und Benutzern durch den Category Service, den To-Do Service und den User Service über REST-APIs. Für die Verwaltung von Ereignissen kommt der Event Service zum Einsatz, der eine flexible Datenabfrage mittels GraphQL ermöglicht. Während REST-APIs klassische CRUD-Operationen ermöglichen, bietet GraphQL die Möglichkeit, nur die benötigten Daten mit minimalem Overhead abzufragen.

Das Frontend wurde mit HTML, CSS und JavaScript programmiert und bietet eine benutzerfreundliche Oberfläche. Zu den Hauptfunktionen zählen eine Kalenderansicht mit verschiedenen Modi (Tag, Woche, Monat), eine To-Do-Liste, Statistiken sowie Formulare und Dialoge zur Erstellung und Verwaltung von Terminen und Kategorien.

Die CORS-Konfiguration (Cross-Origin Resource Sharing) ist eine Sicherheitsmechanik in Webanwendungen, die regelt, welche Ressourcen (z. B. APIs, Dateien) von einer Webanwendung auf einer Domain von einer anderen Domain aus aufgerufen werden dürfen. Diese Mechanik ist besonders wichtig, wenn das Frontend und das Backend einer Anwendung auf unterschiedlichen Servern laufen oder verschiedene Domains nutzen.

Zusammenfassend vereint das Projekt eine flexible Microservice-Architektur mit einer intuitiven Benutzeroberfläche. Das API-Gateway ermöglicht eine effiziente Kommunikation zwischen den Diensten, während das Frontend durch seine interaktiven Funktionen die Nutzer optimal unterstützt. Die Anwendung ist bereit, zukünftigen Anforderungen gerecht zu werden.






## GraphQL(event-service)
### Einführung
Der GraphQL Event Service ist die zentrale Komponente zur Verwaltung von Veranstaltungsdaten innerhalb der Kalenderanwendung. Er ermöglicht es den Nutzern, gezielt Informationen zu Veranstaltungen abzurufen, neue Einträge zu erstellen sowie bestehende Daten flexibel zu bearbeiten oder zu löschen. Unser GraphQL Service bietet dabei die Möglichkeit, präzise nur die tatsächlich benötigten Daten abzufragen, was die Effizienz der API signifikant steigert.
Ein wesentlicher Bestandteil dieses Services ist die Unterstützung von Datum- und Zeitformaten, die über die DateTimeScalarConfiguration integriert werden. Dabei wird die ExtendedScalars.DateTime-Erweiterung genutzt, um eine standardisierte Verarbeitung von Datums- und Zeitwerten innerhalb von GraphQL-Abfragen und -Mutationen zu gewährleisten.

**Die Hauptbestandteile des Event Service sind:**

DateTimeScalarConfiguration: Stellt die GraphQL-Skalartypen für Datum und Zeit bereit.
EventServiceApplication: Die Hauptanwendung für den Event-Service, die mit Spring Boot betrieben wird.
EventServiceApplicationTests: Eine Testklasse zur Sicherstellung der erfolgreichen Kontextinitialisierung der Anwendung.
Durch den Einsatz von Spring Boot und GraphQL ermöglicht dieser Service eine hochgradig anpassbare und performante Event-Datenverwaltung für Anwendungen, die Echtzeitdaten benötigen.

Mit seiner Flexibilität und Erweiterbarkeit ist unser GraphQL Event Service optimal darauf ausgelegt, große Datenmengen effizient zu verarbeiten und die Anforderungen moderner Anwendungen zu erfüllen.
###Achitektur(event service)
**1. GraphQL-Integration**
Für die effiziente Datenabfrage setzen wir auf GraphQL, das durch spring-boot-starter-graphql integriert wurde. GraphQL ermöglicht es, nur die benötigten Daten anzufordern, wodurch die Performance verbessert wird.

**Wichtige Klasse:**
DateTimeScalarConfiguration: Registriert den DateTime-Skalartyp von ExtendedScalars, um komplexe Datums- und Zeitwerte zu verarbeiten.
Code-Ausschnitt:
**DateTimeScalarConfiguration.java**

```java
@Configuration
public class DateTimeScalarConfiguration {
    @Bean
    public GraphQLScalarType dateTimeScalar() {
        return ExtendedScalars.DateTime;
    }

}
```
**2. Erweiterte Datentypen**
Um komplexe Datums- und Zeitangaben im Event-Service korrekt zu verarbeiten, verwenden wir die Bibliothek graphql-java-extended-scalars. Diese bietet den erweiterten ExtendedScalars.DateTime-Typ, der speziell für die Verwendung in GraphQL entwickelt wurde und sicherstellt, dass Datumsangaben korrekt formatiert und verfügbar sind.

Bezug zu unserem Code:
Der DateTime-Datentyp wird in der DateTimeScalarConfiguration-Klasse registriert und in die Laufzeitverkabelung des GraphQL-Schemas integriert, sodass er in API-Anfragen und -Antworten genutzt werden kann.

**3.Reduzierung von Wiederholender Code durch Lombok**
Ein wichtiger Teil unserer Architektur ist der Einsatz von Lombok, um wiederholten Code zu vermeiden. Lombok generiert automatisch Getter, Setter, Konstruktoren und Builder-Methoden, was den Code übersichtlicher und wartungsfreundlicher macht.

**Technische Details:**
Lombok übernimmt die automatische Generierung von Methoden wie Getter, Setter und Konstruktoren, wodurch die Notwendigkeit entfällt, diese manuell zu schreiben und die Lesbarkeit sowie Wartbarkeit des Codes verbessert wird.

**Bezug zu unserem Code:**
In Klassen wie **EventServiceApplication** hilft Lombok, redundante Codeteile zu eliminieren und steigert die Entwicklungseffizienz.


**Zusammenfassung der relevanten Code-Stellen**

| **Datei**                        | **Funktion**                                                                            |
|-----------------------------------|----------------------------------------------------------------------------------------|
| DateTimeScalarConfiguration.java | Registriert den DateTime-Skalar für GraphQL                                           |
| EventServiceApplication.java   | Startet die Anwendung und lädt die Konfiguration                                        |
| EventResolver.java            | Verwendet LocalDateTime, das automatisch in DateTime umgewandelt wird               |
| pom.xml                        | Fügt die graphql-java-extended-scalars-Bibliothek als Abhängigkeit hinzu              |


**4.Teststrategie**  

Um die Stabilität und Zuverlässigkeit unseres Services sicherzustellen, setzen wir auf eine umfassende Teststrategie, die sowohl Unit- als auch Integrationstests umfasst.  
Mithilfe von **Spring Boot Test** und **Spring GraphQL Test** prüfen wir die Funktionsweise der GraphQL-API und gewährleisten, dass der Service in allen Szenarien korrekt arbeitet.  
**Technische Details**  
- **Spring Boot Test** lädt den Anwendungskontext und führt Tests auf Service-Ebene aus.  
- **Spring GraphQL Test** ermöglicht gezielte Tests von GraphQL-Queries, um sicherzustellen, dass die API erwartungsgemäß auf Anfragen reagiert.
  
**Bezug zu unserem Code**  
In der `EventServiceApplicationTests`-Klasse werden Unit-Tests ausgeführt, um zu prüfen, ob der Anwendungskontext korrekt geladen wird und die grundlegende Funktionalität gewährleistet ist.  
## Erklärung des Schemas##
Das GraphQL-Schema des Event Service definiert die Struktur und die möglichen Interaktionen mit den Veranstaltungsdaten. Es ermöglicht sowohl das Abrufen als auch das Erstellen, Aktualisieren und Löschen von Events. Die Implementierung erfolgt mit Spring Boot und GraphQL, wobei spezielle Datentypen wie DateTime unterstützt werden.

**1. Queries: Abruf von Event-Daten**
**Ein Event anhand der ID abrufen**
```
@QueryMapping
public Event event(@Argument String id) {
    return Optional.ofNullable(events.get(id))
            .orElseThrow(() -> new NoSuchElementException("Event mit der angegebenen ID wurde nicht gefunden."));
}
```
Diese Methode sucht ein Event anhand der id. Falls es nicht existiert, wird eine NoSuchElementException geworfen.

**Alle Events eines Benutzers abrufen**
```
@QueryMapping
    public List<Event> eventsByUser(@Argument String userId) {
        return events.values().stream()
                .filter(event -> event.getUserId().equals(userId))
                .collect(Collectors.toList());
    }
```
Hier werden alle Events zurückgegeben, die einem bestimmten Benutzer gehören. Die userId dient als Filterkriterium.

**Events innerhalb eines bestimmten Zeitraums abrufen**
```
@QueryMapping
    public List<Event> eventsByDateRange(@Argument LocalDateTime start, @Argument LocalDateTime end) {
        return events.values().stream()
                .filter(event -> !event.getStart().isBefore(start) && !event.getEnd().isAfter(end))
                .collect(Collectors.toList());
    }
```
Diese Methode filtert Events basierend auf dem Start- und Enddatum und gibt nur diejenigen zurück, die sich innerhalb des angegebenen Zeitraums befinden.

**2. Mutations: Erstellung und Bearbeitung von Events**
```
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
```
Diese Methode erstellt ein neues Event. Falls das Startdatum nach dem Enddatum liegt, wird eine IllegalArgumentException ausgelöst.


**Ein bestehendes Event aktualisieren**
```
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
```
Bestehende Events können über diese Methode aktualisiert werden. Falls die id nicht existiert, wird eine NoSuchElementException geworfen.

**Ein Event löschen**
```
public boolean deleteEvent(@Argument String id) {
    return events.remove(id) != null;
}

```
Diese Methode löscht ein Event anhand der id und gibt true zurück, falls das Event erfolgreich entfernt wurde.


**3. Unterstützung von DateTime als Skalartyp**

```
@Bean
public GraphQLScalarType dateTimeScalar() {
    return ExtendedScalars.DateTime;
}


```
GraphQL unterstützt DateTime nicht nativ, weshalb es über ExtendedScalars.DateTime als benutzerdefinierter Typ hinzugefügt wird. Dadurch können Zeitstempel in Abfragen und Mutations korrekt verarbeitet werden.

 **Zusammenfassung**

| **Methode** | **Typ** | **Beschreibung** |
|------------|---------|-----------------|
| `event(id)` | Query | Ruft ein Event anhand der ID ab |
| `eventsByUser(userId)` | Query | Ruft alle Events eines bestimmten Benutzers ab |
| `eventsByDateRange(start, end)` | Query | Ruft alle Events in einem bestimmten Zeitraum ab |
| `createEvent(...)` | Mutation | Erstellt ein neues Event |
| `updateEvent(...)` | Mutation | Aktualisiert ein bestehendes Event |
| `deleteEvent(id)` | Mutation | Löscht ein Event |
| `dateTimeScalar()` | Bean | Fügt `DateTime` als benutzerdefinierten Skalartyp hinzu |
