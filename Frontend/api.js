// api.js
const API_BASE_URL = 'http://localhost:8080/api';

// Central error handling
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

// Event service for GraphQL operations
class EventService {
   // Retrieve events within a specific date range
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

            // Create new event
            static async createEvent({ title, start, end, userId, priority, categoryId }) {
                const mutation = `
                    mutation CreateEvent(
                        $title: String!, 
                        $start: DateTime!, 
                        $end: DateTime!, 
                        $userId: String!, 
                        $priority: Priority!, 
                        $categoryId: String
                    ) {
                        createEvent(
                            title: $title,
                            start: $start,
                            end: $end,
                            userId: $userId,
                            priority: $priority,
                            categoryId: $categoryId
                        ) {
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

   // Update event
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

// Delete event
    static async deleteEvent(eventId) {
        const mutation = `
            mutation DeleteEvent($id: ID!) {
                deleteEvent(id: $id)
            }
        `;
        return this.sendGraphQLQuery(mutation, { id: eventId });
    }

// Retrieve individual event by ID
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

    // Send GraphQL queries and mutations
    static async sendGraphQLQuery(query, variables) {
        try {
            const response = await fetch(`http://localhost:8080/graphql`, {                
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors.map(e => e.message).join(', '));
            }
            return result.data;
        } catch (error) {
            console.error("GraphQL-Fehler:", error);
            throw error;
        }
    }
}

// REST Todo Service
// REST Todo Service
class TodoService {
// Get all todos of a user
    static async getTodos(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos?userId=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Check if the response is an array or has the expected structur
            if (Array.isArray(data)) {
                return data.map(todo => ({
                    ...todo,
                    links: todo._links || {},
                }));
            } else if (data._embedded && data._embedded.todoList) {
                return data._embedded.todoList.map(todo => ({
                    ...todo,
                    links: todo._links || {},
                }));
            } else {
                // Fallback if no todos were found
                return [];
            }
        } catch (error) {
            console.error('Fehler beim Laden der Todos:', error);
            return [];// Return empty array instead of throwing error
        }
    }

    // Create new todo
    static async createTodo({ title, description, userId }) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos`, {
                method: 'POST',
                headers: {
                    ...defaultHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description, userId, completed: false })
            });

            if (!response.ok) {
                throw new Error('Fehler beim Erstellen des Todos');
            }

            const todo = await response.json();
            return {
                ...todo,
                links: todo._links || {},
            };
        } catch (error) {
            console.error('Fehler beim Erstellen des Todos:', error);
            throw error;
        }
    }

  // Toggle todo status
    static async toggleTodo(todoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${todoId}/toggle`, {
                method: 'PATCH',
                headers: defaultHeaders
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Todo nicht gefunden');
                }
                throw new Error('Fehler beim Umschalten des Todo-Status');
            }

            return await response.json();
        } catch (error) {
            console.error('Fehler beim Umschalten des Todo-Status:', error);
            throw error;
        }
    }

    // Todo delete
    static async deleteTodo(todoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
                method: 'DELETE',
                headers: defaultHeaders
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Todo nicht gefunden');
                }
                throw new Error('Fehler beim Löschen des Todos');
            }

            return true;
        } catch (error) {
            console.error('Fehler beim Löschen des Todos:', error);
            throw error;
        }
    }

    // Get Todo by ID
    static async getTodoById(todoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/todos/${todoId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Todo nicht gefunden');
                }
                throw new Error('Fehler beim Laden des Todos');
            }

            const todo = await response.json();
            return {
                ...todo,
                links: todo._links || {},
            };
        } catch (error) {
            console.error('Fehler beim Laden des Todos:', error);
            throw error;
        }
    }
}
// REST User Service --> should be done
class UserService {
    // login method
    static async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }), //Password will be sent here
            });

            if (!response.ok) {
                throw new Error('Login fehlgeschlagen');
            }

            const user = await response.json();

           // Return the user data
            return user;
        } catch (error) {
            console.error('Login-Fehler:', error);
            throw error;
        }
    }

   // registration method
    static async register(user) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            const data = await response.json();

            if (!response.ok) {
               // Try to parse the response as JSON
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    // If that fails, extract the text
                    errorData = { message: await response.text() };
                }
                throw new Error(errorData.message || 'Registrierung fehlgeschlagen');
            }
        
            return data;
        } catch (error) {
            console.error('Registrierungsfehler:', error);
            handleError(error);
        }
    }
        
 // Get user information
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

  // Get all users
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
// Update user
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

// Deleting a user
    static async deleteUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Benutzers');
            }

            return true; // Successful deletion
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            throw error;
        }
    }
}

// Category Service (placeholder for future implementation)
class CategoryService {
//TBD

}

// Central API export
export const api = {
    events: EventService,
    todos: TodoService,
    users: UserService,
    categories: CategoryService,
};
