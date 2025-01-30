// api.js
const API_BASE_URL = 'http://localhost:8080/api';

// Zentrale Fehlerbehandlung
const handleError = (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
        switch (error.response.status) {
            case 400:
                alert('Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.');
                break;
            case 401:
                alert('Nicht autorisiert. Bitte melden Sie sich an.');
                window.location.href = '/login';
                break;
            case 403:
                alert('Zugriff verweigert.');
                break;
            case 404:
                alert('Ressource nicht gefunden.');
                break;
            case 409:
                alert('Konflikt mit bestehendem Eintrag.');
                break;
            case 422:
                alert('Validierungsfehler. Bitte überprüfen Sie Ihre Eingaben.');
                break;
            case 500:
                alert('Serverfehler. Bitte versuchen Sie es später erneut.');
                break;
            default:
                alert(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
        }
    } else if (error.message) {
        alert(`Fehler: ${error.message}`);
    }
    throw error;
};

const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
};

// Event-Service für GraphQL-Operationen
class EventService {
    // Events innerhalb eines bestimmten Datumsbereichs abrufen
    static async getEvents(start, end) {
        const query = `
            query EventsByDateRange($start: DateTime!, $end: DateTime!) {
                eventsByDateRange(start: $start, end: $end) {
                    id
                    title
                    start
                    end
                    userId
                    priority
                    categoryId
                }
            }
        `;
        return this.sendGraphQLQuery(query, { start, end });
    }

    // Neues Event erstellen
    static async createEvent({ title, start, end, userId, priority, categoryId }) {
        const mutation = `
            mutation CreateEvent($title: String!, $start: DateTime!, $end: DateTime!, $userId: String!, $priority: Priority!, $categoryId: String) {
                createEvent(title: $title, start: $start, end: $end, userId: $userId, priority: $priority, categoryId: $categoryId) {
                    id
                    title
                    start
                    end
                    userId
                    priority
                    categoryId
                }
            }
        `;
        return this.sendGraphQLQuery(mutation, { title, start, end, userId, priority, categoryId });
    }

    // Event aktualisieren
    static async updateEvent(eventId, updates) {
        const mutation = `
            mutation UpdateEvent($id: ID!, $title: String, $start: DateTime, $end: DateTime, $priority: Priority, $categoryId: String) {
                updateEvent(id: $id, title: $title, start: $start, end: $end, priority: $priority, categoryId: $categoryId) {
                    id
                    title
                    start
                    end
                    userId
                    priority
                    categoryId
                }
            }
        `;
        return this.sendGraphQLQuery(mutation, { id: eventId, ...updates });
    }

    // Event löschen
    static async deleteEvent(eventId) {
        const mutation = `
            mutation DeleteEvent($id: ID!) {
                deleteEvent(id: $id)
            }
        `;
        return this.sendGraphQLQuery(mutation, { id: eventId });
    }

    // Einzelnes Event anhand der ID abrufen
    static async getEventById(eventId) {
        const query = `
            query GetEvent($id: ID!) {
                event(id: $id) {
                    id
                    title
                    start
                    end
                    userId
                    priority
                    categoryId
                }
            }
        `;
        return this.sendGraphQLQuery(query, { id: eventId });
    }

    // GraphQL-Abfragen und Mutationen senden
    static async sendGraphQLQuery(query, variables) {
        try {
            const response = await fetch(`http://localhost:8080/graphql`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables }),
            });
            const result = await response.json();
            if (result.errors) throw new Error(result.errors[0].message);
            return result.data;
        } catch (error) {
            console.error("GraphQL-Fehler:", error);
            throw error;
        }
    }
}

// REST Todo Service
class TodoService {
    // Alle Todos eines Benutzers abrufen
    static async getTodos(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos?userId=${userId}`);
            if (!response.ok) throw new Error('Fehler beim Laden der Todos');
            const data = await response.json();
            return data._embedded.todoList.map(todo => ({
                ...todo,
                links: todo._links, // HATEOAS-Links hinzufügen
            }));
        } catch (error) {
            handleError(error);
        }
    }

    // Neues Todo erstellen
    static async createTodo({ title, description, userId }) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, userId }),
            });
            if (!response.ok) throw new Error('Fehler beim Erstellen des Todos');
            const todo = await response.json();
            return {
                ...todo,
                links: todo._links, // HATEOAS-Links hinzufügen
            };
        } catch (error) {
            handleError(error);
        }
    }

    // Todo-Status umschalten
    static async toggleTodo(todo) {
        try {
            const toggleLink = todo.links.toggle.href;
            const response = await fetch(toggleLink, { method: 'PATCH' });
            if (!response.ok) throw new Error('Fehler beim Aktualisieren des Todos');
            const updatedTodo = await response.json();
            return {
                ...updatedTodo,
                links: updatedTodo._links,
            };
        } catch (error) {
            handleError(error);
        }
    }

    // Todo löschen
    static async deleteTodo(todo) {
        try {
            const deleteLink = todo.links.self.href;
            const response = await fetch(deleteLink, { method: 'DELETE' });
            if (!response.ok) throw new Error('Fehler beim Löschen des Todos');
            return true;
        } catch (error) {
            handleError(error);
        }
    }

    // Todo nach ID abrufen
    static async getTodoById(todoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${todoId}`);
            if (!response.ok) throw new Error('Todo nicht gefunden');
            const todo = await response.json();
            return {
                ...todo,
                links: todo._links,
            };
        } catch (error) {
            handleError(error);
        }
    }
}

// REST User Service --> should be done
class UserService {
    // Login-Methode
    static async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }), // Passwort wird hier gesendet
            });

            if (!response.ok) {
                throw new Error('Login fehlgeschlagen');
            }

            const user = await response.json();

            // Rückgabe der Benutzerdaten
            return user;
        } catch (error) {
            console.error('Login-Fehler:', error);
            throw error;
        }
    }

    // Registrierungsmethode
    static async register(email, password, name) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }), // Sende Registrierungsdaten
            });

            if (!response.ok) {
                throw new Error('Registrierung fehlgeschlagen');
            }

            const user = await response.json();

            // Rückgabe der Benutzerdaten
            return user;
        } catch (error) {
            console.error('Registrierungsfehler:', error);
            throw error;
        }
    }

    // Benutzerinformationen abrufen
    static async getUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);

            if (!response.ok) {
                throw new Error('Benutzer nicht gefunden');
            }

            return await response.json();
        } catch (error) {
            console.error('Fehler beim Abrufen des Benutzers:', error);
            throw error;
        }
    }

    // Alle Benutzer abrufen
    static async getAllUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`);

            if (!response.ok) {
                throw new Error('Fehler beim Abrufen der Benutzerliste');
            }

            return await response.json();
        } catch (error) {
            console.error('Fehler beim Abrufen aller Benutzer:', error);
            throw error;
        }
    }

    // Benutzer aktualisieren
    static async updateUser(userId, userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Aktualisieren des Benutzers');
            }

            return await response.json();
        } catch (error) {
            console.error('Fehler beim Aktualisieren:', error);
            throw error;
        }
    }

    // Löschen eines Benutzers
    static async deleteUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Benutzers');
            }

            return true; // Erfolgreiches Löschen
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            throw error;
        }
    }
}


// Category Service (Platzhalter für zukünftige Implementierung)
class CategoryService {
//TBD

}

// Zentraler API-Export
export const api = {
    events: EventService,
    todos: TodoService,
    users: UserService,
    categories: CategoryService,
};
