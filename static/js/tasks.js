// Tasks functionality
let allTasks = [];
let filteredTasks = [];
let currentFilter = 'all';
let currentView = 'list';

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setupEventListeners();
    updateStats();
});

// Konfiguracja event listeners
function setupEventListeners() {
    // Form submit dla nowego zadania
    document.getElementById('newTaskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createNewTask();
    });
    
    // Zamknięcie modalow po kliknięciu poza nimi
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeNewTaskModal();
            closeEditTaskModal();
        }
    });
    
    // ESC key dla zamknięcia modali
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeNewTaskModal();
            closeEditTaskModal();
        }
    });
}

// Ładowanie zadań z serwera
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (data.success) {
            allTasks = data.tasks;
        } else {
            allTasks = [];
        }
        applyFilter();
        updateStats();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Błąd podczas ładowania zadań', 'error');
    }
}

// Aktualizacja statystyk
function updateStats() {
    const total = allTasks.length;
    const pending = allTasks.filter(task => !task.is_completed).length;
    const completed = allTasks.filter(task => task.is_completed).length;
    const urgent = allTasks.filter(task => 
        !task.is_completed && 
        task.due_date && 
        new Date(task.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    ).length;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('urgentTasks').textContent = urgent;
}

// Aplikowanie filtra
function applyFilter() {
    switch(currentFilter) {
        case 'pending':
            filteredTasks = allTasks.filter(task => !task.is_completed);
            break;
        case 'completed':
            filteredTasks = allTasks.filter(task => task.is_completed);
            break;
        case 'urgent':
            filteredTasks = allTasks.filter(task => 
                !task.is_completed && 
                task.due_date && 
                new Date(task.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
            );
            break;
        default:
            filteredTasks = [...allTasks];
    }
}

// Renderowanie zadań
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        tasksList.appendChild(emptyState);
        return;
    }
    
    emptyState.style.display = 'none';
    
    tasksList.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

// Tworzenie elementu zadania
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.is_completed ? 'completed' : ''}`;
    
    const priority = getPriorityFromDueDate(task.due_date);
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('pl-PL') : '';
    
    taskDiv.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${task.title}</h3>
            <div class="task-actions-inline">
                ${!task.is_completed ? `
                    <button class="task-btn complete" onclick="completeTask(${task.id})" title="Oznacz jako ukończone">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                <button class="task-btn edit" onclick="editTask(${task.id})" title="Edytuj">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete" onclick="deleteTask(${task.id})" title="Usuń">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
        <div class="task-meta">
            <span class="task-priority ${priority}">${getPriorityLabel(priority)}</span>
            ${dueDate ? `<span>Termin: ${dueDate}</span>` : ''}
            <span>Utworzone: ${new Date(task.created_at).toLocaleDateString('pl-PL')}</span>
        </div>
    `;
    
    return taskDiv;
}

// Pomocnicze funkcje dla priorytetu
function getPriorityFromDueDate(dueDate) {
    if (!dueDate) return 'medium';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'urgent';
    if (diffDays <= 1) return 'high';
    if (diffDays <= 3) return 'medium';
    return 'low';
}

function getPriorityLabel(priority) {
    const labels = {
        low: 'Niski',
        medium: 'Średni',
        high: 'Wysoki',
        urgent: 'Pilny'
    };
    return labels[priority] || 'Średni';
}

// Modal nowego zadania
function openNewTaskModal() {
    document.getElementById('newTaskModal').classList.add('show');
    document.getElementById('taskTitle').focus();
}

function closeNewTaskModal() {
    document.getElementById('newTaskModal').classList.remove('show');
    document.getElementById('newTaskForm').reset();
}

// Tworzenie nowego zadania
async function createNewTask() {
    const formData = new FormData(document.getElementById('newTaskForm'));
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        due_date: formData.get('due_date') || null,
        mentor_id: formData.get('mentor_id') || null
    };
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const result = await response.json();
        showNotification('Zadanie utworzone pomyślnie!', 'success');
        closeNewTaskModal();
        loadTasks();
        
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Błąd podczas tworzenia zadania', 'error');
    }
}

// Oznaczanie zadania jako ukończone
async function completeTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/complete`, {
            method: 'PUT'
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        showNotification('Zadanie ukończone!', 'success');
        loadTasks();
        
    } catch (error) {
        console.error('Error completing task:', error);
        showNotification('Błąd podczas oznaczania zadania', 'error');
    }
}

// Usuwanie zadania
async function deleteTask(taskId) {
    if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        showNotification('Zadanie usunięte', 'success');
        loadTasks();
        
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Błąd podczas usuwania zadania', 'error');
    }
}

// Edycja zadania (placeholder)
function editTask(taskId) {
    // TODO: Implementacja edycji zadania
    showNotification('Edycja zadań będzie dostępna wkrótce', 'info');
}

// Modal edycji zadania
function closeEditTaskModal() {
    document.getElementById('editTaskModal').classList.remove('show');
}

// Filtrowanie zadań
function filterTasks(filter) {
    currentFilter = filter;
    applyFilter();
    renderTasks();
    
    // Zamknij dropdown
    document.getElementById('filterDropdown').classList.remove('show');
}

// Przełączanie dropdown filtra
function toggleFilterDropdown() {
    const dropdown = document.getElementById('filterDropdown');
    dropdown.classList.toggle('show');
}

// Zmiana widoku (lista/siatka)
function setView(view) {
    currentView = view;
    
    // Aktualizuj przyciski
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    // Aktualizuj klasy CSS dla layoutu
    const tasksList = document.getElementById('tasksList');
    if (view === 'grid') {
        tasksList.classList.add('grid-view');
    } else {
        tasksList.classList.remove('grid-view');
    }
}

// System powiadomień
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        case 'info':
            notification.style.background = '#3b82f6';
            break;
        default:
            notification.style.background = '#6b7280';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Zamknięcie dropdownów po kliknięciu poza nimi
document.addEventListener('click', function(e) {
    if (!e.target.closest('.filter-dropdown')) {
        document.getElementById('filterDropdown').classList.remove('show');
    }
});

// Sortowanie zadań
function sortTasks(criteria) {
    switch(criteria) {
        case 'date':
            filteredTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'priority':
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            filteredTasks.sort((a, b) => {
                const aPriority = getPriorityFromDueDate(a.due_date);
                const bPriority = getPriorityFromDueDate(b.due_date);
                return priorityOrder[bPriority] - priorityOrder[aPriority];
            });
            break;
        case 'title':
            filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    renderTasks();
}

// Eksport zadań
function exportTasks() {
    const csvContent = [
        ['Tytuł', 'Opis', 'Status', 'Termin', 'Utworzone'],
        ...filteredTasks.map(task => [
            task.title,
            task.description || '',
            task.is_completed ? 'Ukończone' : 'W trakcie',
            task.due_date ? new Date(task.due_date).toLocaleDateString('pl-PL') : '',
            new Date(task.created_at).toLocaleDateString('pl-PL')
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zadania_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'n':
                e.preventDefault();
                openNewTaskModal();
                break;
            case 'e':
                e.preventDefault();
                exportTasks();
                break;
        }
    }
});
