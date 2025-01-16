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
        `
        
        this.eventModal.show();
    }
}
    // Event Handling
    async openNewEventModal() {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + (60 * 60 * 1000));
        
        this.eventTitleInput.value = '';
        this.eventStartInput.value = this.formatDateTimeForInput(now);
        this.eventEndInput.value = this.formatDateTimeForInput(oneHourLater);
        
        const categorySelect = document.querySelector('select[name="priority"]');
        if (categorySelect) {
            categorySelect.innerHTML = `
                <optgroup label="Standard">
                    <option value="high">Wichtig</option>
                    <option value="medium" selected>Standard</option>
                    <option value="low">Optional</option>
                </optgroup>
                <optgroup label="Benutzerdefiniert">
                    ${this.customCategories.map(cat => 
                        `<option value="${cat.id}">${cat.name}</option>`
                    ).join('')}
                </optgroup>
            `;
        }
        
        this.eventModal.show();
    }

    async saveEvent() {
        const title = this.eventTitleInput.value;
        const startInput = this.eventStartInput.value;
        const endInput = this.eventEndInput.value;
        const start = new Date(startInput.replace('T', ' '));
        const end = new Date(endInput.replace('T', ' '));
        const selectedValue = document.querySelector('select[name="priority"]')?.value;
    
//TO BE DONE
}

    async editEvent(event) {
        document.querySelector('#eventModal .modal-title').textContent = 'Termin bearbeiten';
        
        this.eventTitleInput.value = event.title;
        this.eventStartInput.value = this.formatDateTimeForInput(new Date(event.start));
        this.eventEndInput.value = this.formatDateTimeForInput(new Date(event.end));
        
        const prioritySelect = document.querySelector('select[name="priority"]');
        if (prioritySelect) {
            prioritySelect.value = event.priority;
        }
        
        // Speichere die Event-ID für das Update
        this.editingEventId = event.id;
        
        // Lösch-Button hinzufügen
        const modalFooter = document.querySelector('.modal-footer');
        if (modalFooter) {
            // Entferne vorhandene Lösch-Buttons
            modalFooter.querySelectorAll('.btn-danger').forEach(btn => btn.remove());
            
            // Füge neuen Lösch-Button hinzu
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.textContent = 'Löschen';
            deleteBtn.onclick = () => this.deleteEvent(event);
            
            modalFooter.insertBefore(deleteBtn, modalFooter.firstChild);
        }
        
        this.eventModal.show();
    }

    async deleteEvent(event) {
//TO BE DONE       
    }

    // Todo Handling
    async addTodo() {
//TO BE DONE
    }

    async toggleTodo(id) {
//TO BE DONE 
    }

    async deleteTodo(id) {
       //TO BE DONE
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        if (!todoList) return;

        todoList.innerHTML = '';
        
        this.todos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span>${todo.text}</span>
                <i class="bi bi-x todo-delete"></i>
            `;

            const checkbox = todoItem.querySelector('.todo-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            }

            const deleteBtn = todoItem.querySelector('.todo-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
            }

            todoList.appendChild(todoItem);
        });
    }

    // Kategorie Handling
    async saveCategory() {
        const nameInput = document.getElementById('categoryName');
        const colorInput = document.getElementById('categoryColor');
        
        const name = nameInput?.value.trim();
        const color = colorInput?.value;

        if (!name) {
            alert('Bitte geben Sie einen Namen ein');
            return;
        }

        try {
            // TO BE DONE
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Fehler beim Erstellen der Kategorie');
        }
    }

    async deleteCategory(categoryId) {
        try {
            //TO BE DONE
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Fehler beim Löschen der Kategorie');
        }
    }

    renderCategories() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;

        // Entferne alte benutzerdefinierte Kategorien
        categoriesList.querySelectorAll('.custom-category').forEach(el => el.remove());
        
        // Füge benutzerdefinierte Kategorien hinzu
        this.customCategories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'custom-category';
            li.innerHTML = `
                <label>
                    <input type="checkbox" checked data-category-id="${category.id}">
                    <span class="color-dot" style="background-color: ${category.color}"></span>
                    <span>${category.name}</span>
                </label>
                <button class="delete-category-btn" data-category-id="${category.id}">
                    Löschen
                </button>
            `;
            
            const deleteBtn = li.querySelector('.delete-category-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Möchten Sie diese Kategorie wirklich löschen?')) {
                        this.deleteCategory(category.id);
                    }
                });
            }
            
            const checkbox = li.querySelector('input');
            if (checkbox) {
                checkbox.addEventListener('change', () => this.render());
            }
            
            categoriesList.appendChild(li);
        });
    }
    