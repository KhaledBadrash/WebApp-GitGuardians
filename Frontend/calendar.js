import { api } from './api.js';

// State Management
let currentUser = null;
let calendar = null;

// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');
const eventModal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');

// Authentication Handlers
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const response = await api.users.login(email, password);
        currentUser = response;
        
        loginForm.reset();
        showApp();
        initializeCalendar();
        loadTodos();
    } catch (error) {
        alert('Login fehlgeschlagen: ' + error.message);
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        const response = await api.users.register(email, password, name);
        currentUser = response;
        
        registerForm.reset();
        showApp();
        initializeCalendar();
        loadTodos();
    } catch (error) {
        alert('Registrierung fehlgeschlagen: ' + error.message);
    }
});

// UI Toggle Handlers
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-box').classList.add('d-none');
    document.getElementById('register-box').classList.remove('d-none');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-box').classList.add('d-none');
    document.getElementById('login-box').classList.remove('d-none');
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    calendar.destroy();
    calendar = null;
    showAuth();
});

// Calendar Initialization
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true,
        selectable: true,
        events: loadEvents,
        eventClick: handleEventClick,
        select: handleDateSelect,
        eventDrop: handleEventDrop,
        eventResize: handleEventResize
    });
    calendar.render();
}

/// Event Handlers
async function loadEvents(info, successCallback, failureCallback) {
    try {
        const response = await api.events.getEvents(info.start.toISOString(), info.end.toISOString());
        const events = response.eventsByDateRange.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            className: `event-${event.priority.toLowerCase()}`,
            extendedProps: {
                userId: event.userId,
                priority: event.priority,
                categoryId: event.categoryId
            }
        }));
        successCallback(events);
    } catch (error) {
        failureCallback(error);
    }
}

async function handleEventClick(info) {
    const event = info.event;
    if (event.extendedProps.userId !== currentUser.id) {
        alert('Sie können nur Ihre eigenen Events bearbeiten.');
        return;
    }

    document.getElementById('event-title').value = event.title;
    document.getElementById('event-start').value = formatDateTime(event.start);
    document.getElementById('event-end').value = formatDateTime(event.end);
    document.getElementById('event-priority').value = event.extendedProps.priority;

    eventForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedEvent = {
                title: document.getElementById('event-title').value,
                start: new Date(document.getElementById('event-start').value),
                end: new Date(document.getElementById('event-end').value),
                priority: document.getElementById('event-priority').value,
                categoryId: event.extendedProps.categoryId
            };

            await api.events.updateEvent(event.id, updatedEvent);
            calendar.refetchEvents();
            closeEventModal();
        } catch (error) {
            alert('Fehler beim Aktualisieren des Events: ' + error.message);
        }
    };

    openEventModal();
}

async function handleDateSelect(info) {
    document.getElementById('event-title').value = '';
    document.getElementById('event-start').value = formatDateTime(info.start);
    document.getElementById('event-end').value = formatDateTime(info.end);
    document.getElementById('event-priority').value = 'MEDIUM';

    eventForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
            const newEvent = {
                title: document.getElementById('event-title').value,
                start: new Date(document.getElementById('event-start').value),
                end: new Date(document.getElementById('event-end').value),
                userId: currentUser.id,
                priority: document.getElementById('event-priority').value
            };

            await api.events.createEvent(newEvent);
            calendar.refetchEvents();
            closeEventModal();
        } catch (error) {
            alert('Fehler beim Erstellen des Events: ' + error.message);
        }
    };

    openEventModal();
}

async function handleEventDrop(info) {
    if (info.event.extendedProps.userId !== currentUser.id) {
        info.revert();
        alert('Sie können nur Ihre eigenen Events bearbeiten.');
        return;
    }

    try {
        await api.events.updateEvent(info.event.id, {
            start: info.event.start,
            end: info.event.end
        });
    } catch (error) {
        info.revert();
        alert('Fehler beim Aktualisieren des Events: ' + error.message);
    }
}

async function handleEventResize(info) {
    if (info.event.extendedProps.userId !== currentUser.id) {
        info.revert();
        alert('Sie können nur Ihre eigenen Events bearbeiten.');
        return;
    }

    try {
        await api.events.updateEvent(info.event.id, {
            end: info.event.end
        });
    } catch (error) {
        info.revert();
        alert('Fehler beim Aktualisieren des Events: ' + error.message);
    }
}

// Todo Management
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const todoInput = document.getElementById('todo-input');
    const title = todoInput.value.trim();
    
    if (!title) return;

    try {
        const newTodo = await api.todos.createTodo({
            title,
            userId: currentUser.id
        });
        
        addTodoToList(newTodo);
        todoInput.value = '';
    } catch (error) {
        alert('Fehler beim Erstellen des Todos: ' + error.message);
    }
});

async function loadTodos() {
    try {
        const todos = await api.todos.getTodos(currentUser.id);
        todoList.innerHTML = '';
        todos.forEach(addTodoToList);
    } catch (error) {
        alert('Fehler beim Laden der Todos: ' + error.message);
    }
}

function addTodoToList(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.innerHTML = `
        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
        <span>${todo.title}</span>
        <button class="delete-todo">×</button>
    `;

    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', async () => {
        try {
            await api.todos.toggleTodo(todo);
            li.classList.toggle('completed');
        } catch (error) {
            checkbox.checked = !checkbox.checked;
            alert('Fehler beim Aktualisieren des Todos: ' + error.message);
        }
    });

    const deleteBtn = li.querySelector('.delete-todo');
    deleteBtn.addEventListener('click', async () => {
        try {
            await api.todos.deleteTodo(todo);
            li.remove();
        } catch (error) {
            alert('Fehler beim Löschen des Todos: ' + error.message);
        }
    });

    todoList.appendChild(li);
}

// Utility Functions
function formatDateTime(date) {
    return new Date(date).toISOString().slice(0, 16);
}

function openEventModal() {
    eventModal.style.display = 'block';
}

function closeEventModal() {
    eventModal.style.display = 'none';
    eventForm.onsubmit = null;
}

function showAuth() {
    authContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
}

function showApp() {
    authContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    userNameSpan.textContent = currentUser.name;
}

// Modal Close Button
document.querySelector('.modal .close').addEventListener('click', closeEventModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        closeEventModal();
    }
});

// Initialize Modal Event Listeners
function initModalListeners() {
    // Delete event button handler
    const deleteEventBtn = document.getElementById('delete-event-btn');
    if (deleteEventBtn) {
        deleteEventBtn.addEventListener('click', async () => {
            const eventId = deleteEventBtn.dataset.eventId;
            if (!eventId) return;

            try {
                await api.events.deleteEvent(eventId);
                calendar.refetchEvents();
                closeEventModal();
            } catch (error) {
                alert('Fehler beim Löschen des Events: ' + error.message);
            }
        });
    }
}

// Category Management
async function loadCategories() {
    try {
        const categories = await api.categories.getAllCategories();
        const categorySelect = document.getElementById('event-category');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Keine Kategorie</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
    }
}

// Keyboard Event Handlers
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEventModal();
    }
});

// Calendar View Controls
const viewButtons = {
    month: document.getElementById('view-month'),
    week: document.getElementById('view-week'),
    day: document.getElementById('view-day')
};

Object.entries(viewButtons).forEach(([view, button]) => {
    if (button) {
        button.addEventListener('click', () => {
            calendar.changeView(view + 'GridView');
            updateActiveViewButton(view);
        });
    }
});

function updateActiveViewButton(activeView) {
    Object.entries(viewButtons).forEach(([view, button]) => {
        if (button) {
            button.classList.toggle('active', view === activeView);
        }
    });
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('calendarTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('calendarTheme', newTheme);
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }, 100);
}

// Error Handler
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    showNotification(
        error.response?.data?.message || error.message || 'Ein Fehler ist aufgetreten',
        'error'
    );
}

// Initialize Application
async function initializeApp() {
    try {
        // Check for stored authentication
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            currentUser = JSON.parse(storedAuth);
            showApp();
            initializeCalendar();
            await Promise.all([
                loadTodos(),
                loadCategories()
            ]);
        } else {
            showAuth();
        }

        initTheme();
        initModalListeners();
    } catch (error) {
        handleError(error, 'initialization');
        showAuth(); // Fallback to auth view on error
    }
}

// Start the application
initializeApp();
// Export necessary functions for testing
export {
    initializeApp,
    handleError,
    showNotification,
    loadCategories,
    updateActiveViewButton
};
