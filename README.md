# GitGuardians – Termin-Assistent (Microservices)

**GitGuardians** ist eine webbasierte Kalender-/Termin-Assistent-Anwendung mit **Microservice-Architektur**.
Das Projekt kombiniert **REST** (User/Todo/Category) und **GraphQL** (Event-Service) hinter einem zentralen
**API-Gateway** (Spring Cloud Gateway). Das Frontend ist bewusst „lean“ gehalten (HTML/CSS/Vanilla JS + Bootstrap)
und kommuniziert ausschließlich über das Gateway.

## Architektur (High-Level)

Frontend (Browser, :5500)
└─> API Gateway (Spring Cloud Gateway, :8080)
├─> Event-Service (GraphQL, :8081)
├─> User-Service (REST, :8082)
├─> Todo-Service (REST, :8083)
└─> Category-Service (REST, :8084)


**Routing über das Gateway (`:8080`)**
- `POST /graphql` → Event-Service (`:8081`)
- `/api/users/**` → User-Service (`:8082`)
- `/api/todos/**` → Todo-Service (`:8083`)
- `/api/categories/**` → Category-Service (`:8084`)

CORS ist im Gateway so konfiguriert, dass ein lokales Frontend (z. B. VS Code Live Server auf `:5500`) zugreifen kann.

---

## Features (aktueller Stand)

### Frontend
- Login / Registrierung (UI)
- Kalenderansicht mit **Month/Week/Day** Views
- CRUD für Termine/Events inkl. **Priorität** (HIGH/MEDIUM/LOW) über GraphQL
- Todo-Liste: Anlegen, Anzeigen, Toggle (erledigt/offen), Löschen

### Backend
- **API Gateway** als Single Entry Point + CORS
- **Event-Service (GraphQL)**: `Query`/`Mutation` für Events, `DateTime` Scalar (Extended Scalars)
- **User/Todo/Category (REST)**: CRUD-Endpunkte, teilweise mit **HATEOAS Links**

---

## Tech-Stack

- **Frontend:** HTML, CSS, JavaScript (ES Modules), Bootstrap
- **Backend:** Java 17, Spring Boot 3.x
- **Gateway:** Spring Cloud Gateway (reactive)
- **Event-Service:** Spring for GraphQL + `graphql-java-extended-scalars` (`DateTime`)
- **REST-Services:** Spring Web (+ HATEOAS bei User/Todo/Category)
- **Build:** Maven Wrapper (`mvnw` / `mvnw.cmd`)

---

## Lokales Setup & Start

### Voraussetzungen
- **Java 17 (JDK)**
- (Optional) **VS Code** + Extension „Live Server“ für das Frontend

### Ports
- Gateway: `8080`
- Event-Service: `8081`
- User-Service: `8082`
- Todo-Service: `8083`
- Category-Service: `8084`
- Frontend (Live Server): typischerweise `5500`

### Start – Backend (je Service ein Terminal)

**Windows (PowerShell)**
```powershell
cd Backend\event-service
.\mvnw.cmd spring-boot:run

cd Backend\user-service
.\mvnw.cmd spring-boot:run

cd Backend\todo-service
.\mvnw.cmd spring-boot:run

cd Backend\category-service\category-service
.\mvnw.cmd spring-boot:run

cd Backend\api-gateway
.\mvnw.cmd spring-boot:run

macOS/Linux (bash/zsh)

cd Backend/event-service && ./mvnw spring-boot:run
cd Backend/user-service  && ./mvnw spring-boot:run
cd Backend/todo-service  && ./mvnw spring-boot:run
cd Backend/category-service/category-service && ./mvnw spring-boot:run
cd Backend/api-gateway   && ./mvnw spring-boot:run




Start – Frontend

Öffne Frontend/index.html mit VS Code Live Server (Port 5500), oder

starte einen einfachen Static Server deiner Wahl.

Das Frontend spricht standardmäßig das Gateway an:

REST Basis: http://localhost:8080/api

GraphQL Endpoint: http://localhost:8080/graphql


API – Beispiele
REST (über Gateway)

User registrieren
curl -X POST "http://localhost:8080/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Max Mustermann","email":"max@example.com","password":"secret"}'


Todos eines Users abrufen

curl "http://localhost:8080/api/todos?userId=<USER_ID>"


Todo togglen

curl -X PATCH "http://localhost:8080/api/todos/<TODO_ID>/toggle"

GraphQL (über Gateway)

Events in Zeitraum abfragen

curl -X POST "http://localhost:8080/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query":"query($start: DateTime!, $end: DateTime!){ eventsByDateRange(start:$start,end:$end){ id title start end userId priority } }",
    "variables":{"start":"2025-02-01T00:00:00Z","end":"2025-02-28T23:59:59Z"}
  }'


GraphiQL (direkt am Event-Service)

http://localhost:8081/graphiql

Designentscheidungen / Notes für Reviewer

Microservices + Gateway: klare Service-Grenzen, ein zentraler Einstiegspunkt, saubere Client-Anbindung.

REST + GraphQL: REST für klassische CRUD-Resourcen, GraphQL für flexible Event-Abfragen (z. B. Date Ranges).

In-Memory Storage (aktuell): Services nutzen thread-sichere Strukturen (z. B. ConcurrentHashMap).
→ Daten sind nach Neustart weg (bewusst für Entwicklungs-/Demo-Zwecke).

Auth ist bewusst minimal (kein JWT, kein Hashing) – Fokus lag auf API-/Architektur-Patterns.

Repository-Struktur

Frontend/ – UI (HTML/CSS/JS)

Backend/ – Microservices + API Gateway (jeweils eigene Maven-Projekte)

Dokumendatin/ – technische Dokumentation (REST/GraphQL/Gateway)
