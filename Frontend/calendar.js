import { api } from './api.js';

// ============================
// Globale Variablen & DOM-Elemente
// ============================
let currentUser = null;
let currentDate = new Date();
let currentView = 'month';
let events = [];
let eventModal = null;

const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginBox = document.getElementById('login-box');
const registerBox = document.getElementById('register-box');
const userNameDisplay = document.getElementById('user-name');
const toastContainer = document.querySelector('.toast-container');

// ============================
// Authentifizierungs- & UI-Toggle
// ============================
document.getElementById('show-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginBox.classList.add('d-none');
    registerBox.classList.remove('d-none');
});

document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    registerBox.classList.add('d-none');
    loginBox.classList.remove('d-none');
});

// Login-Formular
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
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
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
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
document.getElementById('logout-btn')?.addEventListener('click', () => {
    currentUser = null;
    hideMainApp();
    showToast('Erfolgreich ausgeloggt', 'info');
});

// ============================
// To‑Do-Funktionalitäten
// ============================
document.getElementById('todo-form')?.addEventListener('submit', async (e) => {
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
        showToast('Fehler beim Laden der Todos', 'error');
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
            showToast('Das Todo wurde nicht gefunden', 'error');
        } else {
            showToast('Fehler beim Ändern des Todo-Status', 'error');
        }
        await refreshTodos();
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
            showToast('Das Todo existiert nicht mehr', 'error');
        } else {
            showToast('Fehler beim Löschen des Todos', 'error');
        }
        await refreshTodos();
    }
};

// ============================
// Kalender-Funktionalitäten
// ============================
function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
        new Date(year, month).toLocaleString('de-DE', { month: 'long', year: 'numeric' });

    if (currentView === 'month') {
        renderMonthView(calendarEl, year, month);
    } else if (currentView === 'week') {
        renderWeekView(calendarEl);
    } else {
        renderDayView(calendarEl);
    }
}

function renderMonthView(container, year, month) {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

    let html = '<table class="w-100"><thead><tr>';
    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    weekdays.forEach(day => {
        html += `<th class="text-center p-2">${day}</th>`;
    });
    html += '</tr></thead><tbody>';

    for (let i = 0; i < 6; i++) {
        html += '<tr>';
        for (let j = 0; j < 7; j++) {
            const date = new Date(startDate);
            const isToday = isSameDay(date, new Date());
            const isOtherMonth = date.getMonth() !== month;
            
            html += `<td class="position-relative ${isToday ? 'bg-light' : ''} ${isOtherMonth ? 'text-muted' : ''}" 
                        style="height: 100px; border: 1px solid #dee2e6;"
                        data-date="${date.toISOString()}"
                        onclick="handleDateClick(new Date('${date.toISOString()}'))">
                        <div class="p-1">
                            <span class="date-number position-absolute top-0 start-0 p-1">${date.getDate()}</span>
                            <div class="events-container mt-4">
                                ${renderEventsForDate(date)}
                            </div>
                        </div>
                    </td>`;
            startDate.setDate(startDate.getDate() + 1);
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderEventsForDate(date) {
    return events
        .filter(event => isSameDay(new Date(event.start), date))
        .map(event => `
            <div class="event p-1 mb-1 rounded text-truncate event-${event.priority.toLowerCase()}" 
                 style="font-size: 0.8em; cursor: pointer;"
                 onclick="handleEventClick('${event.id}')">
                ${event.title}
            </div>
        `).join('');
}

function renderWeekView(container) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  let html = '<table class="w-100"><thead><tr><th style="width: 60px">Zeit</th>';
  
  // Kopfzeile mit Wochentagen
  for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const isToday = isSameDay(day, new Date());
      html += `<th class="text-center ${isToday ? 'bg-light' : ''}">${formatWeekDay(day)}<br>${day.getDate()}</th>`;
  }
  html += '</tr></thead><tbody>';

  // Zeitslots
  for (let hour = 0; hour < 24; hour++) {
      html += '<tr>';
      html += `<td class="text-center">${String(hour).padStart(2, '0')}:00</td>`;
      
      for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          date.setHours(hour, 0, 0, 0);
          const isNow = isCurrentHour(date);
          
          html += `<td class="position-relative ${isNow ? 'bg-light' : ''}" 
                      style="height: 60px; border: 1px solid #dee2e6;"
                      data-date="${date.toISOString()}"
                      onclick="handleDateClick(new Date('${date.toISOString()}'))">
                      <div class="events-container">
                          ${renderEventsForHour(date)}
                      </div>
                  </td>`;
      }
      html += '</tr>';
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderDayView(container) {
  const day = currentDate;
  let html = '<table class="w-100"><thead><tr>';
  html += '<th style="width: 60px">Zeit</th>';
  html += `<th class="text-center">${formatWeekDay(day)} ${day.getDate()}</th>`;
  html += '</tr></thead><tbody>';

  // Zeitslots
  for (let hour = 0; hour < 24; hour++) {
      const date = new Date(day);
      date.setHours(hour, 0, 0, 0);
      const isNow = isCurrentHour(date);

      html += '<tr>';
      html += `<td class="text-center">${String(hour).padStart(2, '0')}:00</td>`;
      html += `<td class="position-relative ${isNow ? 'bg-light' : ''}" 
                  style="height: 60px; border: 1px solid #dee2e6;"
                  data-date="${date.toISOString()}"
                  onclick="handleDateClick(new Date('${date.toISOString()}'))">
                  <div class="events-container">
                      ${renderEventsForHour(date)}
                  </div>
              </td>`;
      html += '</tr>';
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}

// Hilfsfunktionen

function formatWeekDay(date) {
  return date.toLocaleString('de-DE', { weekday: 'short' });
}

function isCurrentHour(date) {
  const now = new Date();
  return date.getHours() === now.getHours() && 
         date.getDate() === now.getDate() && 
         date.getMonth() === now.getMonth() && 
         date.getFullYear() === now.getFullYear();
}

function renderEventsForHour(date) {
  return events
      .filter(event => {
          const eventStart = new Date(event.start);
          return eventStart.getHours() === date.getHours() && 
                 isSameDay(eventStart, date);
      })
      .map(event => `
          <div class="event p-1 mb-1 rounded text-truncate event-${event.priority.toLowerCase()}" 
               style="font-size: 0.8em; cursor: pointer;"
               onclick="handleEventClick('${event.id}')">
              ${event.title}
          </div>
      `).join('');
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

async function loadEvents() {
  try {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Konvertierung in UTC
      const utcStart = Date.UTC(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate());
      const utcEnd = Date.UTC(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + 1);

      const response = await api.events.getEvents(
          new Date(utcStart).toISOString(),
          new Date(utcEnd).toISOString()
      );
      
      events = response.eventsByDateRange || [];
      renderCalendar();
  } catch (error) {
      console.error('Fehler beim Laden der Events:', error);
      showToast('Fehler beim Laden der Events', 'error');
  }
}

// Event Handlers für den Kalender
window.handleDateClick = (date) => {
  // Konvertiere das lokale Datum in UTC
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes()
    )
  );

  // Endzeit berechnen (1 Stunde später)
  const utcEnd = new Date(utcDate);
  utcEnd.setUTCHours(utcDate.getUTCHours() + 1);

  // Formatiere die Datumsangaben in ISO-8601 mit Zeitzoneninformation
  document.getElementById('event-id').value = '';
  document.getElementById('event-title').value = '';
  document.getElementById('event-start').value = formatDateTime(utcDate);
  document.getElementById('event-end').value = formatDateTime(utcEnd);
  document.getElementById('event-priority').value = 'MEDIUM';
  document.getElementById('delete-event').classList.add('d-none');
  
  // Zeige das Modal an
  eventModal.show();
};

window.handleEventClick = async (eventId) => {
  try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      
      if (event.userId !== currentUser.id) {
          showToast('Sie können nur Ihre eigenen Events bearbeiten.', 'error');
          return;
      }

      // Konvertierung von UTC zu Local Time
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      document.getElementById('event-id').value = event.id;
      document.getElementById('event-title').value = event.title;
      document.getElementById('event-start').value = formatDateTime(startDate);
      document.getElementById('event-end').value = formatDateTime(endDate);
      document.getElementById('event-priority').value = event.priority;
      document.getElementById('delete-event').classList.remove('d-none');
      eventModal.show();
  } catch (error) {
      console.error('Fehler beim Laden des Events:', error);
      showToast('Fehler beim Laden des Events', 'error');
  }
};

// Kalender Navigation Event Listeners
document.getElementById('prevMonth')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    loadEvents();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    loadEvents();
});

document.getElementById('today')?.addEventListener('click', () => {
    currentDate = new Date();
    loadEvents();
});

['monthView', 'weekView', 'dayView'].forEach(viewId => {
    document.getElementById(viewId)?.addEventListener('click', (e) => {
        currentView = viewId.replace('View', '');
        document.querySelectorAll('.btn-group .btn').forEach(btn => 
            btn.classList.remove('btn-primary'));
        e.target.classList.add('btn-primary');
        renderCalendar();
    });
});

// Event Form Handler
document.getElementById('event-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Konvertiere die Eingabedaten in UTC
  const start = new Date(document.getElementById('event-start').value);
  const end = new Date(document.getElementById('event-end').value);
  
  const formData = {
    title: document.getElementById('event-title').value,
    start: new Date(Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate(),
      start.getUTCHours(),
      start.getUTCMinutes()
    )).toISOString(),
    end: new Date(Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate(),
      end.getUTCHours(),
      end.getUTCMinutes()
    )).toISOString(),
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
    await loadEvents();
    eventModal.hide();
    showToast('Event gespeichert', 'success');
  } catch (error) {
    showToast('Fehler beim Speichern des Events: ' + error.message, 'error');
  }
});

// Event Deletion Handler
document.getElementById('delete-event')?.addEventListener('click', async () => {
    const eventId = document.getElementById('event-id').value;
    if (!eventId) return;
    try {
        await api.events.deleteEvent(eventId);
        await loadEvents();
        eventModal.hide();
        showToast('Event gelöscht', 'success');
    } catch (error) {
        showToast('Fehler beim Löschen des Events: ' + error.message, 'error');
    }
});

// ============================
// App Management Funktionen
// ============================
function showMainApp() {
  console.log('Showing main app...');
  authContainer.classList.add('d-none');
  mainContainer.classList.remove('d-none');
  userNameDisplay.textContent = currentUser.name;
  loadEvents();
  refreshTodos();
}

function hideMainApp() {
  mainContainer.classList.add('d-none');
  authContainer.classList.remove('d-none');
  loginBox.classList.remove('d-none');
  registerBox.classList.add('d-none');
  document.getElementById('login-form').reset();
  document.getElementById('register-form').reset();
}

function formatDateTime(date) {
  return new Date(date).toISOString();
}


function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 mb-2`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
      <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Schließen"></button>
      </div>
  `;
  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// ============================
// Initialisierung
// ============================
document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('event-modal');
  if (modalEl) {
      eventModal = new bootstrap.Modal(modalEl);
  }

  const storedAuth = localStorage.getItem('auth');
  if (storedAuth) {
      try {
          currentUser = JSON.parse(storedAuth);
          showMainApp();
      } catch (error) {
          console.error('Error parsing stored auth:', error);
          hideMainApp();
      }
  } else {
      hideMainApp();
  }
});