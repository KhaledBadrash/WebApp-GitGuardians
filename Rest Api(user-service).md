## REST API Todo-Service

### Einführung
Wir haben einen RESTful User-Service mit Spring Boot entwickelt, der innerhalb unserer Anwendung für die Verwaltung von Benutzerdaten und die Authentifizierung zuständig ist. Zu den Hauptfunktionen gehören die Möglichkeit für neue Benutzer, ein Konto zu erstellen, indem sie ihre E-Mail-Adresse, ihren Namen und ein Passwort angeben. Das System überprüft die Anmeldedaten der Benutzer und stellt bei erfolgreicher Authentifizierung ein Token zur Verfügung, das für nachfolgende Anfragen verwendet werden kann. Zudem bietet es Funktionen zum Abrufen, Aktualisieren und Löschen von Benutzerdaten. Durch diese Funktionen stellen wir sicher, dass nur autorisierte Benutzer Zugriff auf bestimmte Bereiche der Anwendung haben und dass die Benutzerdaten sicher und effizient verwaltet werden.

## Funktionsweise der Rest API
er User-Service ist eine RESTful-Webanwendung, die auf einer klassischen Client-Server-Architektur basiert. Dies bedeutet, dass verschiedene Clients über HTTP-Anfragen mit dem Server kommunizieren, um Benutzer zu erstellen, abzurufen, zu aktualisieren oder zu löschen.
Die API folgt den REST-Prinzipien, wodurch jede Ressource über eine eindeutige URL erreichbar ist. Die Kommunikation erfolgt über die gängigen HTTP-Methoden.

### Aufbau

Die Anwendung besteht aus den folgenden Hauptkomponenten:

- **UserServiceApplication**: Die Einstiegspunktklasse der Anwendung, die die Spring Boot-Anwendung initialisiert und startet.

- **UserController**: Ein REST-Controller, der die Endpunkte für die Benutzerverwaltung bereitstellt.

- **User**: Eine Datenklasse, die die Benutzerdaten mit Attributen wie ID, E-Mail, Name und Passwort repräsentiert.

- **UserNotFoundException**: Eine benutzerdefinierte Ausnahme, die ausgelöst wird, wenn ein Benutzer mit einer bestimmten ID nicht gefunden wird.
**Datenspeicherung.**

// A thread-safe map for storing user data
private final Map<String, User> users = new ConcurrentHashMap<>();

-Die Datenspeicherung findet hier statt
### Methoden

| Methode     | Beschreibung |
|------------|-------------|
| **login**   | Überprüft die Anmeldeinformationen und gibt ein Token zurück. |
| **register** | Registriert einen neuen Benutzer, wenn die E-Mail noch nicht registriert ist. |
| **getUser**  | Ruft einen Benutzer anhand der ID ab. |
| **getAllUsers** | Ruft eine Liste aller gespeicherten Benutzer ab. |
| **updateUser** | Aktualisiert einen bestehenden Benutzer mit neuen Daten. |
| **deleteUser** | Entfernt einen Benutzer anhand der ID. |


### Datenspeicherung

// A thread-safe map for storing user data
private final Map<String, User> users = new ConcurrentHashMap<>();


