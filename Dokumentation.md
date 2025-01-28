## Einleitung
Unsere Anwendung ist ein webbasierter Terminkalender, der es Benutzern ermöglicht, Termine, Aufgaben und Kategorien effizient zu verwalten. Das System wird zentral durch ein API-Gateway gesteuert. Ziel der Anwendung ist es, eine benutzerfreundliche und skalierbare Lösung anzubieten, die sowohl im Frontend als auch im Backend durchdacht umgesetzt wurde. Die Anwendung soll Benutzern helfen, ihren Alltag besser zu organisieren, indem sie eine zentrale Plattform für die Verwaltung von Terminen, Aufgaben und Kategorien bietet.

Die Architektur der Anwendung basiert auf einem API-Gateway, das als zentraler Einstiegspunkt für alle Anfragen fungiert und diese gezielt an die entsprechenden Microservices weiterleitet. Diese Microservices sind eigenständige Module, die spezifische Aufgaben übernehmen, wie die Verwaltung von Kategorien, Aufgaben und Benutzern durch den Category Service, den To-Do Service und den User Service über REST-APIs. Für die Verwaltung von Ereignissen kommt der Event Service zum Einsatz, der eine flexible Datenabfrage mittels GraphQL ermöglicht. Während REST-APIs klassische CRUD-Operationen ermöglichen, bietet GraphQL die Möglichkeit, nur die benötigten Daten mit minimalem Overhead abzufragen.

Das Frontend wurde mit HTML, CSS und JavaScript programmiert und bietet eine benutzerfreundliche Oberfläche. Zu den Hauptfunktionen zählen eine Kalenderansicht mit verschiedenen Modi (Tag, Woche, Monat), eine To-Do-Liste, Statistiken sowie Formulare und Dialoge zur Erstellung und Verwaltung von Terminen und Kategorien.

Die CORS-Konfiguration (Cross-Origin Resource Sharing) ist eine Sicherheitsmechanik in Webanwendungen, die regelt, welche Ressourcen (z. B. APIs, Dateien) von einer Webanwendung auf einer Domain von einer anderen Domain aus aufgerufen werden dürfen. Diese Mechanik ist besonders wichtig, wenn das Frontend und das Backend einer Anwendung auf unterschiedlichen Servern laufen oder verschiedene Domains nutzen.

Zusammenfassend vereint das Projekt eine flexible Microservice-Architektur mit einer intuitiven Benutzeroberfläche. Das API-Gateway ermöglicht eine effiziente Kommunikation zwischen den Diensten, während das Frontend durch seine interaktiven Funktionen die Nutzer optimal unterstützt. Die Anwendung ist bereit, zukünftigen Anforderungen gerecht zu werden.






## GraphQL(event-service)
### Einführung
Der GraphQL Event Service ist die zentrale Komponente zur Verwaltung von Veranstaltungsdaten innerhalb der Kalenderanwendung. Er ermöglicht es den Nutzern, gezielt Informationen zu Veranstaltungen abzurufen, neue Einträge zu erstellen sowie bestehende Daten flexibel zu bearbeiten oder zu löschen. Unser GraphQL Service bietet dabei die Möglichkeit, präzise nur die tatsächlich benötigten Daten abzufragen, was die Effizienz der API signifikant steigert.

Der Service basiert auf Spring Boot und ist mit erweiterten GraphQL-Skalaren ausgestattet, die beispielsweise komplexe Datentypen wie Datum und Uhrzeit unterstützen. Zusätzlich ermöglicht die Einbindung von Web- und WebFlux-Technologien sowohl synchrone als auch reaktive Anfragen. Durch die klare Struktur und Konfiguration des Codes, etwa durch den Einsatz von Maven und Lombok, wird eine schlanke und wartbare Basis geschaffen.

Mit seiner Flexibilität und Erweiterbarkeit ist unser GraphQL Event Service optimal darauf ausgelegt, große Datenmengen effizient zu verarbeiten und die Anforderungen moderner Anwendungen zu erfüllen.






