// Kalendarz JavaScript

let currentDate = new Date();
let currentView = 'month';
let events = [];

// Inicjalizacja kalendarza
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    loadEvents();
    setupEventListeners();
});

function initializeCalendar() {
    updateCalendarHeader();
    generateCalendar();
    updateUpcomingEvents();
}

function setupEventListeners() {
    // Nawigacja kalendarza
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar();
        updateCalendarHeader();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar();
        updateCalendarHeader();
    });

    document.getElementById('todayBtn').addEventListener('click', () => {
        currentDate = new Date();
        generateCalendar();
        updateCalendarHeader();
    });

    // Przełączanie widoków
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            generateCalendar();
        });
    });

    // Dodaj event listener dla przycisku "Nowe wydarzenie"
    const openEventModalBtn = document.getElementById('openEventModal');
    if (openEventModalBtn) {
        openEventModalBtn.addEventListener('click', () => openEventModal());
    }

    // Dodaj event listener dla przycisku "Dzisiaj"
    const todayViewBtn = document.getElementById('todayView');
    if (todayViewBtn) {
        todayViewBtn.addEventListener('click', () => {
            currentDate = new Date();
            generateCalendar();
            updateCalendarHeader();
        });
    }

    // Formularz dodawania wydarzenia
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmit);
    }

    // Zamykanie modala
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    const cancelBtn = document.getElementById('cancelEventModal');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    const eventModal = document.getElementById('eventModal');
    if (eventModal) {
        eventModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
    }

    // Kliknięcie na dzień
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('other-month')) {
            const day = parseInt(e.target.textContent);
            const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            openEventModal(selectedDate);
        }
    });
}

function updateCalendarHeader() {
    const monthNames = [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    
    const monthYear = document.getElementById('currentMonth');
    monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    if (currentView === 'month') {
        generateMonthView();
    } else if (currentView === 'week') {
        generateWeekView();
    } else if (currentView === 'day') {
        generateDayView();
    }
}

function generateMonthView() {
    const calendarGrid = document.getElementById('calendarGrid');
    
    // Nagłówki dni tygodnia
    const dayHeaders = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // Pierwszy dzień miesiąca
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Dni z poprzedniego miesiąca
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); // Poniedziałek = 1
    startDate.setDate(startDate.getDate() - (dayOfWeek - 1));

    // Generowanie 42 dni (6 tygodni)
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);
        
        const dayCell = createDayCell(cellDate, firstDay, lastDay);
        calendarGrid.appendChild(dayCell);
    }
}

function createDayCell(date, firstDay, lastDay) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    // Sprawdź czy to dzień z bieżącego miesiąca
    if (date < firstDay || date > lastDay) {
        dayCell.classList.add('other-month');
    }
    
    // Sprawdź czy to dzisiaj
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        dayCell.classList.add('today');
    }
    
    // Numer dnia
    const dayNumber = document.createElement('span');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();
    dayCell.appendChild(dayNumber);
    
    // Wydarzenia w tym dniu
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
        dayCell.classList.add('has-events');
        
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        
        dayEvents.slice(0, 3).forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = `event-indicator ${event.type}`;
            eventEl.textContent = event.title;
            eventEl.title = `${event.title} - ${event.time || ''}`;
            eventsContainer.appendChild(eventEl);
        });
        
        if (dayEvents.length > 3) {
            const moreEl = document.createElement('div');
            moreEl.className = 'more-events';
            moreEl.textContent = `+${dayEvents.length - 3} więcej`;
            eventsContainer.appendChild(moreEl);
        }
        
        dayCell.appendChild(eventsContainer);
    }
    
    return dayCell;
}

function generateWeekView() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.className = 'calendar-grid week-view';
    
    // Znajdź początek tygodnia (poniedziałek)
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    // Siatka godzin
    for (let hour = 0; hour < 24; hour++) {
        const hourLabel = document.createElement('div');
        hourLabel.className = 'hour-label';
        hourLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
        calendarGrid.appendChild(hourLabel);
        
        for (let day = 0; day < 7; day++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.dataset.hour = hour;
            timeSlot.dataset.day = day;
            
            const slotDate = new Date(startOfWeek);
            slotDate.setDate(startOfWeek.getDate() + day);
            slotDate.setHours(hour, 0, 0, 0);
            
            // Sprawdź wydarzenia w tym czasie
            const slotEvents = getEventsForDateTime(slotDate);
            slotEvents.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.className = `week-event ${event.type}`;
                eventEl.textContent = event.title;
                timeSlot.appendChild(eventEl);
            });
            
            calendarGrid.appendChild(timeSlot);
        }
    }
}

function generateDayView() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.className = 'calendar-grid day-view';
    
    // Siatka godzin dla jednego dnia
    for (let hour = 0; hour < 24; hour++) {
        const hourSlot = document.createElement('div');
        hourSlot.className = 'hour-slot';
        
        const hourLabel = document.createElement('div');
        hourLabel.className = 'hour-label';
        hourLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
        
        const hourContent = document.createElement('div');
        hourContent.className = 'hour-content';
        
        const slotDate = new Date(currentDate);
        slotDate.setHours(hour, 0, 0, 0);
        
        const hourEvents = getEventsForDateTime(slotDate);
        hourEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = `day-event ${event.type}`;
            eventEl.innerHTML = `
                <div class="event-title">${event.title}</div>
                <div class="event-time">${event.time || ''}</div>
                <div class="event-description">${event.description || ''}</div>
            `;
            hourContent.appendChild(eventEl);
        });
        
        hourSlot.appendChild(hourLabel);
        hourSlot.appendChild(hourContent);
        calendarGrid.appendChild(hourSlot);
    }
}

function getEventsForDate(date) {
    return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
    });
}

function getEventsForDateTime(dateTime) {
    return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === dateTime.toDateString() && 
               eventDate.getHours() === dateTime.getHours();
    });
}

function openEventModal(selectedDate = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    
    // Reset formularza
    form.reset();
    
    if (selectedDate) {
        const dateInput = document.getElementById('eventDate');
        const year = selectedDate.getFullYear();
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const day = selectedDate.getDate().toString().padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }
    
    modal.style.display = 'flex';
    document.getElementById('eventTitle').focus();
}

function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
}

function handleEventSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const eventData = {
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        time: formData.get('time'),
        type: formData.get('type'),
        reminder: formData.get('reminder')
    };
    
    // Walidacja
    if (!eventData.title || !eventData.date) {
        showNotification('Proszę wypełnić wymagane pola', 'error');
        return;
    }
    
    addEvent(eventData);
    closeModal();
}

function addEvent(eventData) {
    fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Wydarzenie zostało dodane!', 'success');
            loadEvents(); // Przeładuj wydarzenia
            generateCalendar(); // Odśwież kalendarz
            updateUpcomingEvents();
        } else {
            showNotification('Błąd podczas dodawania wydarzenia', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Błąd połączenia', 'error');
    });
}

function loadEvents() {
    fetch('/api/events')
    .then(response => response.json())
    .then(data => {
        events = data.events || [];
        generateCalendar();
        updateUpcomingEvents();
    })
    .catch(error => {
        console.error('Error loading events:', error);
    });
}

function updateUpcomingEvents() {
    const upcomingContainer = document.getElementById('upcomingEvents');
    const today = new Date();
    
    // Znajdź nadchodzące wydarzenia (następne 7 dni)
    const upcoming = events.filter(event => {
        const eventDate = new Date(event.date);
        const daysDiff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 7;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcoming.length === 0) {
        upcomingContainer.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-day"></i>
                <p>Brak nadchodzących wydarzeń</p>
            </div>
        `;
        return;
    }
    
    upcomingContainer.innerHTML = upcoming.map(event => {
        const eventDate = new Date(event.date);
        const isToday = eventDate.toDateString() === today.toDateString();
        const dayName = eventDate.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
        
        return `
            <div class="upcoming-event ${isToday ? 'today' : ''}">
                <div class="event-date">
                    <span class="date">${dayName}</span>
                    <span class="time">${event.time || ''}</span>
                </div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-type ${event.type}">${getEventTypeLabel(event.type)}</div>
                </div>
                <div class="event-actions">
                    <button class="event-btn edit" onclick="editEvent(${event.id})" title="Edytuj">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="event-btn delete" onclick="deleteEvent(${event.id})" title="Usuń">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getEventTypeLabel(type) {
    const labels = {
        meeting: 'Spotkanie',
        task: 'Zadanie',
        reminder: 'Przypomnienie',
        goal: 'Cel',
        personal: 'Osobiste'
    };
    return labels[type] || type;
}

function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Wypełnij formularz danymi wydarzenia
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventType').value = event.type;
    document.getElementById('eventReminder').value = event.reminder || '';
    
    // Pokaż modal z danymi do edycji
    const modal = document.getElementById('eventModal');
    modal.style.display = 'flex';
    
    // Zmień handler formularza na edycję
    const form = document.getElementById('eventForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        updateEvent(eventId, new FormData(form));
    };
}

function updateEvent(eventId, formData) {
    const eventData = {
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        time: formData.get('time'),
        type: formData.get('type'),
        reminder: formData.get('reminder')
    };
    
    fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Wydarzenie zostało zaktualizowane!', 'success');
            loadEvents();
            closeModal();
            
            // Przywróć normalny handler
            const form = document.getElementById('eventForm');
            form.onsubmit = handleEventSubmit;
        } else {
            showNotification('Błąd podczas aktualizacji wydarzenia', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Błąd połączenia', 'error');
    });
}

function deleteEvent(eventId) {
    if (!confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
        return;
    }
    
    fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Wydarzenie zostało usunięte!', 'success');
            loadEvents();
        } else {
            showNotification('Błąd podczas usuwania wydarzenia', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Błąd połączenia', 'error');
    });
}

function showNotification(message, type = 'info') {
    // Usuń poprzednie powiadomienia
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-usuń po 5 sekundach
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Eksportuj funkcje globalne
window.openEventModal = openEventModal;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
