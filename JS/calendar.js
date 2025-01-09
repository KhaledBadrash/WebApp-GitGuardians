class ModernCalendar {
    constructor() {
        this.events = JSON.parse(localStorage.getItem('events')) || {};
        this.currentDate = new Date();
        this.selectedDate = null;
        this.initializeElements();
        this.initializeEventListeners();
        this.render();
        this.updateStats();
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.initializeTodoList();
        this.customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
        this.initializeCategoryModal();
        this.renderCategories();
    }

    initializeElements() {
        // Grundlegende Elemente
        this.calendarGrid = document.querySelector('.days-grid');
        this.timeColumn = document.querySelector('.time-column');
        this.currentDateDisplay = document.querySelector('.current-date');
        
        // Modal Elemente
        this.eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
        this.eventTitleInput = document.querySelector('.event-title-input');
        this.eventStartInput = document.getElementById('eventStart');
        this.eventEndInput = document.getElementById('eventEnd');
        
        // Stats Elemente
        this.todayEventsCount = document.getElementById('todayEvents');
        this.weekEventsCount = document.getElementById('weekEvents');
        this.totalEventsCount = document.getElementById('totalEvents');
    }

}