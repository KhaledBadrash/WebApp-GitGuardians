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
