// final.js

import { api } from './api.js'; // Stellt Deine API-Funktionen bereit

// ============================
// Globale Variablen & DOM-Elemente
// ============================
let currentUser = null;
let calendar = null;
let eventModal = null; // Bootstrap Modal-Instanz

const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginBox = document.getElementById('login-box');
const registerBox = document.getElementById('register-box');
const userNameDisplay = document.getElementById('user-name');
const toastContainer = document.querySelector('.toast-container');

// ============================
// Authentifizierungs- & UI-Toggle
// ============================

// Wechsel zwischen Login und Registrierung
document.getElementById('show-register').addEventListener('click', (e) => {
  e.preventDefault();
  loginBox.classList.add('d-none');
  registerBox.classList.remove('d-none');
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  registerBox.classList.add('d-none');
  loginBox.classList.remove('d-none');
});

// Login-Formular
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    currentUser = await api.users.login(email, password);
    document.getElementById('login-form').reset();
    showMainApp();
    showToast('Erfolgreich eingeloggt', 'success');
  } catch (error) {
    showToast('Login fehlgeschlagen: ' + error.message, 'error');
  }
});

// Registrierungs-Formular
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const userData = {
      name: document.getElementById('register-name').value,
      email: document.getElementById('register-email').value,
      password: document.getElementById('register-password').value
    };
    currentUser = await api.users.register(userData);
    document.getElementById('register-form').reset();
    showMainApp();
    showToast('Registrierung erfolgreich', 'success');
  } catch (error) {
    showToast('Registrierung fehlgeschlagen: ' + error.message, 'error');
  }
});

// Logout-Button
document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  if (calendar) {
    calendar.destroy();
    calendar = null;
  }
  hideMainApp();
  showToast('Erfolgreich ausgeloggt', 'info');
});

// ============================
// To‑Do-Funktionalitäten
// ============================

document.getElementById('todo-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('todo-input');
  const title = input.value.trim();
  if (!title) return;
  try {
    await api.todos.createTodo({
      title,
      userId: currentUser.id
    });
    input.value = '';
    await refreshTodos();
    showToast('Todo erstellt', 'success');
  } catch (error) {
    showToast('Fehler beim Erstellen des Todos: ' + error.message, 'error');
  }
});

async function refreshTodos() {
    try {
        const todos = await api.todos.getTodos(currentUser.id);
        const todoList = document.getElementById('todo-list');
        
        if (!todos || todos.length === 0) {
            todoList.innerHTML = '<li class="list-group-item">Keine Todos vorhanden</li>';
            return;
        }
        
        todoList.innerHTML = todos.map(todo => `
            <li class="list-group-item todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="form-check d-flex align-items-center">
                    <input 
                        class="form-check-input me-2" 
                        type="checkbox" 
                        ${todo.completed ? 'checked' : ''} 
                        onchange="toggleTodo('${todo.id}')"
                    >
                    <label class="form-check-label flex-grow-1">${todo.title}</label>
                    <button 
                        class="btn btn-sm btn-link text-danger delete-todo" 
                        onclick="deleteTodo('${todo.id}')"
                        aria-label="Todo löschen"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
    } catch (error) {
        console.error('Fehler beim Laden der Todos:', error);
        showToast('Fehler beim Laden der Todos. Bitte versuchen Sie es später erneut.', 'error');
    }
}

window.toggleTodo = async (todoId) => {
    try {
        await api.todos.toggleTodo(todoId);
        await refreshTodos();
        showToast('Todo-Status geändert', 'success');
    } catch (error) {
        console.error('Fehler beim Umschalten des Todo-Status:', error);
        if (error.message === 'Todo nicht gefunden') {
            showToast('Das Todo wurde nicht gefunden. Bitte laden Sie die Seite neu.', 'error');
        } else {
            showToast('Fehler beim Ändern des Todo-Status. Bitte versuchen Sie es später erneut.', 'error');
        }
        await refreshTodos(); // Aktualisiere die Liste um sicherzustellen, dass der UI-Status korrekt ist
    }
};

window.deleteTodo = async (todoId) => {
    try {
        const success = await api.todos.deleteTodo(todoId);
        if (success) {
            await refreshTodos();
            showToast('Todo erfolgreich gelöscht', 'success');
        }
    } catch (error) {
        console.error('Fehler beim Löschen des Todos:', error);
        if (error.message === 'Todo nicht gefunden') {
            showToast('Das Todo wurde bereits gelöscht oder existiert nicht mehr.', 'error');
        } else {
            showToast('Fehler beim Löschen des Todos. Bitte versuchen Sie es später erneut.', 'error');
        }
        await refreshTodos(); // Aktualisiere die Liste um sicherzustellen, dass der UI-Status korrekt ist
    }
};

// ============================
// Kalender & Event-Funktionalitäten
// ============================

function initializeCalendar() {
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: 'de',
    selectable: true,
    editable: true,
    events: fetchEvents,
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventClassNames: (arg) => {
      return ['event-' + arg.event.extendedProps.priority.toLowerCase()];
    }
  });
  calendar.render();
}

async function fetchEvents(info, successCallback, failureCallback) {
  try {
    const response = await api.events.getEvents(info.start.toISOString(), info.end.toISOString());
    const events = response.eventsByDateRange.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      extendedProps: {
        priority: event.priority,
        userId: event.userId
      }
    }));
    successCallback(events);
  } catch (error) {
    failureCallback(error);
  }
}

function handleEventClick(info) {
  const event = info.event;
  // Nur eigene Events bearbeiten
  if (event.extendedProps.userId !== currentUser.id) {
    showToast('Sie können nur Ihre eigenen Events bearbeiten.', 'error');
    return;
  }
  // Formularfelder füllen
  document.getElementById('event-id').value = event.id;
  document.getElementById('event-title').value = event.title;
  document.getElementById('event-start').value = formatDateTime(event.start);
  document.getElementById('event-end').value = formatDateTime(event.end);
  document.getElementById('event-priority').value = event.extendedProps.priority;
  document.getElementById('delete-event').classList.remove('d-none');
  eventModal.show();
}

function handleDateClick(info) {
  const start = new Date(info.date);
  const end = new Date(start);
  end.setHours(start.getHours() + 1);
  // Neues Event – Formular leeren
  document.getElementById('event-id').value = '';
  document.getElementById('event-title').value = '';
  document.getElementById('event-start').value = formatDateTime(start);
  document.getElementById('event-end').value = formatDateTime(end);
  document.getElementById('event-priority').value = 'MEDIUM';
  document.getElementById('delete-event').classList.add('d-none');
  eventModal.show();
}

// Event-Formular (Erstellen/Aktualisieren)
document.getElementById('event-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = {
    title: document.getElementById('event-title').value,
    start: new Date(document.getElementById('event-start').value),
    end: new Date(document.getElementById('event-end').value),
    priority: document.getElementById('event-priority').value,
    userId: currentUser.id
  };
  const eventId = document.getElementById('event-id').value;
  try {
    if (eventId) {
      await api.events.updateEvent(eventId, formData);
    } else {
      await api.events.createEvent(formData);
    }
    calendar.refetchEvents();
    eventModal.hide();
    showToast('Event gespeichert', 'success');
  } catch (error) {
    showToast('Fehler beim Speichern des Events: ' + error.message, 'error');
  }
});

// Event löschen
document.getElementById('delete-event').addEventListener('click', async () => {
  const eventId = document.getElementById('event-id').value;
  if (!eventId) return;
  try {
    await api.events.deleteEvent(eventId);
    calendar.refetchEvents();
    eventModal.hide();
    showToast('Event gelöscht', 'success');
  } catch (error) {
    showToast('Fehler beim Löschen des Events: ' + error.message, 'error');
  }
});

// ============================
// Hilfsfunktionen & UI-Helper
// ============================

function showMainApp() {
  authContainer.classList.add('d-none');
  mainContainer.classList.remove('d-none');
  userNameDisplay.textContent = currentUser.name;
  initializeCalendar();
  refreshTodos();
}

function hideMainApp() {
  mainContainer.classList.add('d-none');
  authContainer.classList.remove('d-none');
  // Formular zurücksetzen
  loginBox.classList.remove('d-none');
  registerBox.classList.add('d-none');
  document.getElementById('login-form').reset();
  document.getElementById('register-form').reset();
}

function formatDateTime(date) {
  return new Date(date).toISOString().slice(0, 16);
}

function showToast(message, type = 'info') {
  // Erstelle ein Toast-Element
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 mb-2`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Schließen"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}

// ============================
// Initialisierung bei DOM-Ready
// ============================
document.addEventListener('DOMContentLoaded', () => {
  // Initialisiere Bootstrap Modal für das Event-Formular
  const modalEl = document.getElementById('event-modal');
  eventModal = new bootstrap.Modal(modalEl);

  // Falls Du gespeicherte Auth-Daten (z. B. in localStorage) nutzen möchtest:
  const storedAuth = localStorage.getItem('auth');
  if (storedAuth) {
    currentUser = JSON.parse(storedAuth);
    showMainApp();
  } else {
    hideMainApp();
  }
});
