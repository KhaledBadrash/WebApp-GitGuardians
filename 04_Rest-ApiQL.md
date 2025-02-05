## REST API (category-service)  
### Einführung  
Der Category Service stellt eine REST API zur Verfügung, die für die Verwaltung und Organisation von Kategorien innerhalb der Anwendung dient. Nutzer können gezielt Informationen zu einzelnen Kategorien abrufen, neue Einträge hinzufügen sowie bestehende Daten aktualisieren oder löschen. Die API wurde so optimiert, dass sie nur die tatsächlich benötigten Daten liefert, wodurch die Antwortzeiten verkürzt und die Ressourcennutzung effizienter gestaltet wird. Dies trägt zur Skalierbarkeit und Leistungsfähigkeit des Systems bei. 
Ein wesentlicher Bestandteil dieses Services ist die Unterstützung von Hypermedia-Links, die über Spring Boot HATEOAS realisiert wird. Dadurch wird eine dynamische Navigation innerhalb der API ermöglicht, indem relevante Endpunkte direkt als Hypermedia-Links in den API-Antworten bereitgestellt werden. Dies verbessert die Interoperabilität zwischen verschiedenen Ressourcen und erleichtert die Einbindung in andere Backend- oder Micros.


**Kernkomponenten des Category Service**  

Der Category Service basiert auf einer modularen Architektur, die eine klare Trennung zwischen API-Steuerung, Geschäftslogik und Datenhaltung sicherstellt. Die Anwendung nutzt Spring Boot und stellt eine REST API bereit, die CRUD-Operationen für Kategorien ermöglicht.  

Die API-Steuerung erfolgt durch den **CategoryController**, der HTTP-Anfragen entgegennimmt und an die entsprechenden Service-Methoden weiterleitet. Die Verarbeitung der Geschäftslogik übernimmt die **CategoryService**-Klasse, die für die Validierung und konsistente Ausführung von Operationen zuständig ist.  

Das Datenmodell wird durch die **Category-Klasse** definiert, die die Struktur einer Kategorie mit Attributen wie Name und Farbe beschreibt. Zur Sicherstellung der Datenintegrität und korrekten API-Funktionalität enthält der Service die **CategoryServiceApplicationTests**, der automatisierten Tests für die Anwendungsausführung und API-Endpunkte bereitstellen.  

