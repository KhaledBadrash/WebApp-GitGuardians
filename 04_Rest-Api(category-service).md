## REST API (category-service)  
### Einführung  
Der Category Service stellt eine REST API zur Verfügung, die für die Verwaltung und Organisation von Kategorien innerhalb der Anwendung dient. Nutzer können gezielt Informationen zu einzelnen Kategorien abrufen, neue Einträge hinzufügen sowie bestehende Daten aktualisieren oder löschen. Die API wurde so optimiert, dass sie nur die tatsächlich benötigten Daten liefert, wodurch die Antwortzeiten verkürzt und die Ressourcennutzung effizienter gestaltet wird. Dies trägt zur Skalierbarkeit und Leistungsfähigkeit des Systems bei. 
Ein wesentlicher Bestandteil dieses Services ist die Unterstützung von Hypermedia-Links, die über Spring Boot HATEOAS realisiert wird. Dadurch wird eine dynamische Navigation innerhalb der API ermöglicht, indem relevante Endpunkte direkt als Hypermedia-Links in den API-Antworten bereitgestellt werden. Dies verbessert die Interoperabilität zwischen verschiedenen Ressourcen und erleichtert die Einbindung in andere Backend- oder Micros.


**Kernkomponenten des Category Service**  

Der Category Service basiert auf einer modularen Architektur, die eine klare Trennung zwischen API-Steuerung, Geschäftslogik und Datenhaltung sicherstellt. Die Anwendung nutzt Spring Boot und stellt eine REST API bereit, die CRUD-Operationen für Kategorien ermöglicht.  

Die API-Steuerung erfolgt durch den **CategoryController**, der HTTP-Anfragen entgegennimmt und an die entsprechenden Service-Methoden weiterleitet. Die Verarbeitung der Geschäftslogik übernimmt die **CategoryService**-Klasse, die für die Validierung und konsistente Ausführung von Operationen zuständig ist.  

Das Datenmodell wird durch die **Category-Klasse** definiert, die die Struktur einer Kategorie mit Attributen wie Name und Farbe beschreibt. Zur Sicherstellung der Datenintegrität und korrekten API-Funktionalität enthält der Service die **CategoryServiceApplicationTests**, der automatisierten Tests für die Anwendungsausführung und API-Endpunkte bereitstellen.  

 **1. REST-Integration**   

Die REST-API des Category Service basiert auf Spring Boot und Spring Web und folgt den RESTful-Prinzipien. Über klar definierte HTTP-Endpunkte (`/api/categories/{id}`) können Kategorien mit `GET`, `POST`, `PUT` und `DELETE` abgerufen, erstellt, aktualisiert oder gelöscht werden. Dies ermöglicht eine standardisierte API-Struktur und eine einfache Integration in andere Systeme.  

**Relevante Klasse:**
CategoryController: Verwaltet die REST-Endpunkte für Kategorien und verarbeitet HTTP-Anfragen (`GET`, `POST`, `PUT`, `DELETE`).

```java
@GetMapping("/{id}")
    public ResponseEntity<EntityModel<Category>> getCategory(@PathVariable int id) {
        // Gets the category out of the list/map based on the ID
        Category category = categories.get(id);

        // If the category does not exist, a custom exception is triggered
        if (category == null) {
            throw new CategoryNotFoundException(id);
        }

        // Creates an EntityModel instance with the category and adds hypermedia links
        return ResponseEntity.ok(EntityModel.of(category,
                // Adds a link to the current category (self-link)
                linkTo(methodOn(CategoryController.class).getCategory(id)).withSelfRel(),
                // Adds a link to all categories of the user
                linkTo(methodOn(CategoryController.class).getAllCategories(category.getUserId()))
                        .withRel("user-categories")));
    }
    ```                                                                                           
 **2. Erweiterte Datentypen**  

Der **Category Service** verarbeitet Datums- und Zeitwerte mit **LocalDateTime** aus Java 17. Dank der integrierten Unterstützung von **Spring Boot und Jackson** wird LocalDateTime automatisch ins **ISO 8601-Format** (yyyy-MM-dd'T'HH:mm:ss) umgewandelt. Dadurch bleiben Zeitangaben in API-Anfragen und -Antworten einheitlich und werden korrekt zwischen Client und Server übertragen.  

#### **Bezug zu unserem Code:**  
Das Feld createdAt im **Category**-Modell ist als LocalDateTime definiert. Da Spring Boot diesen Typ nativ unterstützt, erfolgt die Konvertierung automatisch, sodass keine zusätzliche Verarbeitung erforderlich ist.  
