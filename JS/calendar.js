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
        // Basic elements
        this.calendarGrid = document.querySelector('.days-grid');
        this.timeColumn = document.querySelector('.time-column');
        this.currentDateDisplay = document.querySelector('.current-date');
        
        // Modal elements
        this.eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
        this.eventTitleInput = document.querySelector('.event-title-input');
        this.eventStartInput = document.getElementById('eventStart');
        this.eventEndInput = document.getElementById('eventEnd');
        
        // Stats elements
        this.todayEventsCount = document.getElementById('todayEvents');
        this.weekEventsCount = document.getElementById('weekEvents');
        this.totalEventsCount = document.getElementById('totalEvents');
    }
    initializeEventListeners() {
        // Navigation listeners
        document.querySelector('.today-btn').addEventListener('click', () => this.goToToday());
        document.querySelector('.nav-arrows').children[0].addEventListener('click', () => this.changeWeek(-1));
        document.querySelector('.nav-arrows').children[1].addEventListener('click', () => this.changeWeek(1));
        
        // Event creation listeners
        document.querySelector('.create-event-btn').addEventListener('click', () => this.openNewEventModal());
        document.querySelector('.save-event').addEventListener('click', () => this.saveEvent());
        
        // View change listener
        document.querySelector('.view-selector').addEventListener('change', (e) => this.changeView(e.target.value));
        
        // Category filter listener
        document.querySelectorAll('.calendars-list input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.render();
            });
        });
    }

    openNewEventModal() {
        // Set default values for the new event
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + (60 * 60 * 1000));
        
        this.eventTitleInput.value = '';
        this.eventStartInput.value = this.formatDateTimeForInput(now);
        this.eventEndInput.value = this.formatDateTimeForInput(oneHourLater);
        
        // Update category selection
        const categorySelect = document.querySelector('select[name="priority"]');
        categorySelect.innerHTML = `
            <optgroup label="Standard">
                <option value="high">Important</option>
                <option value="medium" selected>Standard</option>
                <option value="low">Optional</option>
            </optgroup>
            <optgroup label="Custom">
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
                    <option value="high">Important</option>
                    <option value="medium" selected>Standard</option>
                    <option value="low">Optional</option>
                </optgroup>
                <optgroup label="Custom">
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
        document.querySelector('#eventModal .modal-title').textContent = 'Edit Event';
        
        this.eventTitleInput.value = event.title;
        this.eventStartInput.value = this.formatDateTimeForInput(new Date(event.start));
        this.eventEndInput.value = this.formatDateTimeForInput(new Date(event.end));
        
        const prioritySelect = document.querySelector('select[name="priority"]');
        if (prioritySelect) {
            prioritySelect.value = event.priority;
        }
        
        // Store the event ID for updating
        this.editingEventId = event.id;
        
        // Add delete button
        const modalFooter = document.querySelector('.modal-footer');
        if (modalFooter) {
            // Remove existing delete buttons
            modalFooter.querySelectorAll('.btn-danger').forEach(btn => btn.remove());
            
            // Add new delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.textContent = 'Delete';
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
    // Calendar Grid Rendering
    render() {
        this.renderTimeColumn();
        this.renderDaysGrid();
        if (this.currentDateDisplay) {
            this.currentDateDisplay.textContent = this.formatMonthYear(this.currentDate);
        }
        this.scrollToCurrentTime();
    }

    renderTimeColumn() {
        if (!this.timeColumn) return;
        
        this.timeColumn.innerHTML = '';
        
        const headerCell = document.createElement('div');
        headerCell.className = 'time-header';
        headerCell.style.height = '50px';
        this.timeColumn.appendChild(headerCell);
        
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = ${hour.toString().padStart(2, '0')}:00;
            timeSlot.setAttribute('data-hour', hour);
            this.timeColumn.appendChild(timeSlot);
        }
    }

    renderDaysGrid() {
        if (!this.calendarGrid) return;
        
        this.calendarGrid.innerHTML = '';
        const startOfWeek = this.getStartOfWeek(this.currentDate);

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            
            const dayColumn = this.createDayColumn(currentDay);
            this.calendarGrid.appendChild(dayColumn);
        }
    }

    createDayColumn(date) {
        const column = document.createElement('div');
        column.className = 'day-column';
        column.setAttribute('data-date', this.formatDate(date));
        
        const header = document.createElement('div');
        header.className = 'day-header';
        if (this.isToday(date)) {
            header.classList.add('today');
        }
        header.textContent = this.formatDayHeader(date);
        column.appendChild(header);
    
        const dateKey = this.formatDate(date);
        if (this.events[dateKey]) {
            this.events[dateKey].forEach(event => {
                const eventElement = this.createEventElement(event);
                if (eventElement) {
                    column.appendChild(eventElement);
                }
            });
        }
    
        // Drag & Drop Handler hinzufügen
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
        });
        
        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });
        
        column.addEventListener('drop', async (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
    
            const eventData = JSON.parse(e.dataTransfer.getData('text/plain'));
            const rect = column.getBoundingClientRect();
            const mouseY = e.clientY - rect.top + column.scrollTop;
            const minutes = Math.floor(mouseY);
    
            // Event verschieben
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const newDate = new Date(date);
            newDate.setHours(hours, mins, 0, 0);
            
            const duration = new Date(eventData.end) - new Date(eventData.start);
            const endDate = new Date(newDate.getTime() + duration);
            
            //TBD
                
                this.loadInitialData();
            } catch (error) {
                console.error('Error moving event:', error);
                alert('Fehler beim Verschieben des Termins');
            }
        });
    
        return column;
    }

    createEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.setAttribute('data-event-id', event.id);
        
        // Position und Style
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
        const duration = (endDate - startDate) / (1000 * 60); // Dauer in Minuten

        eventElement.style.top = ${startMinutes}px;
        eventElement.style.height = ${duration}px;

        // Füge Prioritäts-Stil hinzu
        eventElement.classList.add(priority-${event.priority});

        // Event Inhalt
        eventElement.innerHTML = `
            <div class="event-time">${this.formatTime(startDate)} - ${this.formatTime(endDate)}</div>
            <div class="event-title">${event.title}</div>
            <div class="resize-handle top"></div>
            <div class="resize-handle bottom"></div>
        `;

        // Event Listener
        eventElement.draggable = true;
        eventElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(event));
            e.target.classList.add('dragging');
        });
        
        eventElement.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });

        eventElement.addEventListener('click', () => this.editEvent(event));

        // Resize Handles
        this.addResizeHandlers(eventElement, event);

        return eventElement;
    }

    addResizeHandlers(element, event) {
        const handles = {
            top: element.querySelector('.resize-handle.top'),
            bottom: element.querySelector('.resize-handle.bottom')
        };

        if (!handles.top || !handles.bottom) return;

        const handleResize = (e, handle) => {
            e.stopPropagation();
            
            const startY = e.clientY;
            const startTop = parseInt(element.style.top) || 0;
            const startHeight = element.offsetHeight;

            const move = (moveEvent) => {
                const diff = moveEvent.clientY - startY;
                
                if (handle === 'top') {
                    const newTop = startTop + diff;
                    const newHeight = startHeight - diff;
                    
                    if (newHeight >= 20 && newTop >= 0) {
                        element.style.top = ${newTop}px;
                        element.style.height = ${newHeight}px;
                    }
                } else {
                    const newHeight = startHeight + diff;
                    if (newHeight >= 20) {
                        element.style.height = ${newHeight}px;
                    }
                }
            };

            const stop = async () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', stop);
                
                const newTop = parseInt(element.style.top);
                const newHeight = element.offsetHeight;
                
                const startDate = new Date(event.start);
                const startHour = Math.floor(newTop / 60);
                const startMin = newTop % 60;
                
                startDate.setHours(startHour, startMin, 0, 0);
                const endDate = new Date(startDate.getTime() + newHeight * 60000);

                //TBD
                    
                    this.loadInitialData();
                } catch (error) {
                    console.error('Error resizing event:', error);
                    alert('Fehler beim Ändern der Termingröße');
                }
            };

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
        };

        handles.top.addEventListener('mousedown', (e) => handleResize(e, 'top'));
        handles.bottom.addEventListener('mousedown', (e) => handleResize(e, 'bottom'));
    }

    // Hilfsfunktionen
    formatDateTimeForInput(date) {
        return date.toISOString().slice(0, 16);
    }

    formatDate(date) {
        return date.toLocaleDateString('sv').split('T')[0];
    }

    formatDayHeader(date) {
        return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' });
    }

    formatMonthYear(date) {
        return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    }

    formatTime(date) {
        return date.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getStartOfWeek(date) {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        return start;
    }

    scrollToCurrentTime() {
        const now = new Date();
        const hourHeight = 60;
        const scrollPosition = (now.getHours() + now.getMinutes() / 60) * hourHeight;
        
        const calendarGrid = document.querySelector('.calendar-grid');
        if (calendarGrid) {
            calendarGrid.scrollTop = scrollPosition - (calendarGrid.clientHeight / 3);
        }
    }

    // Navigation
    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    changeWeek(offset) {
        this.currentDate.setDate(this.currentDate.getDate() + (offset * 7));
        this.render();
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    window.calendar = new TerminCalender();
});
    
    
    