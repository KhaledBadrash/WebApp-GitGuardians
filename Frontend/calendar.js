import { api } from './api.js';

// State Management
let currentUser = null;

// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
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
    showAuth();
});

// UI Management Functions
function showAuth() {
    authContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
}

function showApp() {
    authContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    userNameSpan.textContent = currentUser.name;

    // Kalender und Todos initialisieren
    initializeCalendar();
    loadTodos();
}

// Initialize Application
async function initializeApp() {
    try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            currentUser = JSON.parse(storedAuth);
            showApp();
        } else {
            showAuth();
        }
    } catch (error) {
        console.error('Fehler bei der Initialisierung:', error);
        showAuth();
    }
}

initializeApp();
let calendar = null;

// DOM Elements
const eventModal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');

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
                priority: event.priority
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
                priority: document.getElementById('event-priority').value
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
