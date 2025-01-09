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
    initializeEventListeners() {
        // Navigation Listeners
        document.querySelector('.today-btn').addEventListener('click', () => this.goToToday());
        document.querySelector('.nav-arrows').children[0].addEventListener('click', () => this.changeWeek(-1));
        document.querySelector('.nav-arrows').children[1].addEventListener('click', () => this.changeWeek(1));
        
        // Event Creation Listeners
        document.querySelector('.create-event-btn').addEventListener('click', () => this.openNewEventModal());
        document.querySelector('.save-event').addEventListener('click', () => this.saveEvent());
        
        // View Change Listener
        document.querySelector('.view-selector').addEventListener('change', (e) => this.changeView(e.target.value));
        
        // Kategorie-Filter Listener
        document.querySelectorAll('.calendars-list input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.render();
            });
        });
    }

    openNewEventModal() {
        // Setze Standardwerte für das neue Event
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + (60 * 60 * 1000));
        
        this.eventTitleInput.value = '';
        this.eventStartInput.value = this.formatDateTimeForInput(now);
        this.eventEndInput.value = this.formatDateTimeForInput(oneHourLater);
        
        // Aktualisiere die Kategorie-Auswahl
        const categorySelect = document.querySelector('select[name="priority"]');
        categorySelect.innerHTML = `
            <optgroup label="Standard">
                <option value="high">Wichtig</option>
                <option value="medium" selected>Standard</option>
                <option value="low">Optional</option>
            </optgroup>
            <optgroup label="Benutzerdefiniert">
                ${this.customCategories.map(cat => 
                    <option value="${cat.id}">${cat.name}</option>
                ).join('')}
            </optgroup>
        `;
        
        this.eventModal.show();
    }
}