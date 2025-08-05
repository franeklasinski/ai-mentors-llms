// Chat functionality
let isTyping = false;
let messageInput;
let sendButton;
let chatMessages;
let charCount;

// Inicjalizacja
document.addEventListener('DOMContentLoaded', function() {
    messageInput = document.getElementById('messageInput');
    sendButton = document.getElementById('sendButton');
    chatMessages = document.getElementById('chatMessages');
    charCount = document.getElementById('charCount');
    
    setupEventListeners();
    scrollToBottom();
    autoResizeTextarea();
});

// Konfiguracja event listenerów
function setupEventListeners() {
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        autoResizeTextarea();
        updateCharCount();
        updateSendButton();
    });
    
    // Wysyłanie wiadomości przez Enter
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Fokus na input po załadowaniu
    messageInput.focus();
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

// Aktualizacja licznika znaków
function updateCharCount() {
    const count = messageInput.value.length;
    charCount.textContent = count;
    
    if (count > 900) {
        charCount.style.color = '#ef4444';
    } else if (count > 800) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#94a3b8';
    }
}

// Aktualizacja stanu przycisku wysyłania
function updateSendButton() {
    const hasText = messageInput.value.trim().length > 0;
    sendButton.disabled = !hasText || isTyping;
}

// Wysyłanie wiadomości
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isTyping) return;
    
    // Wyczyść input
    messageInput.value = '';
    autoResizeTextarea();
    updateCharCount();
    updateSendButton();
    
    // Dodaj wiadomość użytkownika do UI
    addMessageToUI(message, true);
    
    // Pokaż wskaźnik pisania
    showTypingIndicator();
    
    try {
        // Wyślij wiadomość do serwera
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mentor_id: MENTOR_ID,
                message: message
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Symuluj opóźnienie odpowiedzi
        setTimeout(() => {
            hideTypingIndicator();
            addMessageToUI(data.response, false);
        }, 1000 + Math.random() * 2000);
        
    } catch (error) {
        console.error('Error sending message:', error);
        hideTypingIndicator();
        addMessageToUI('Przepraszam, wystąpił błąd. Spróbuj ponownie.', false, true);
    }
}

// Dodawanie wiadomości do UI
function addMessageToUI(message, isUser, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'mentor'}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    if (isUser) {
        avatarDiv.innerHTML = '<i class="fas fa-user"></i>';
    } else {
        avatarDiv.innerHTML = `<img src="/static/images/placeholder-${MENTOR_ID === 1 || MENTOR_ID === 3 ? 'female' : 'male'}.svg" alt="${MENTOR_NAME}">`;
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    if (isError) bubbleDiv.style.background = '#fee2e2';
    bubbleDiv.textContent = message;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = getCurrentTime();
    
    contentDiv.appendChild(bubbleDiv);
    contentDiv.appendChild(timeDiv);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Wskaźnik pisania
function showTypingIndicator() {
    isTyping = true;
    updateSendButton();
    document.getElementById('loadingIndicator').style.display = 'flex';
}

function hideTypingIndicator() {
    isTyping = false;
    updateSendButton();
    document.getElementById('loadingIndicator').style.display = 'none';
}

// Scroll do dołu
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Pobieranie aktualnego czasu
function getCurrentTime() {
    return new Date().toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Wstawianie sugestii
function insertSuggestion(suggestion) {
    messageInput.value = suggestion;
    messageInput.focus();
    autoResizeTextarea();
    updateCharCount();
    updateSendButton();
}

// Czyszczenie czatu
function clearChat() {
    if (confirm('Czy na pewno chcesz wyczyścić historię czatu?')) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-avatar">
                    <img src="/static/images/placeholder-${MENTOR_ID === 1 || MENTOR_ID === 3 ? 'female' : 'male'}.svg" alt="${MENTOR_NAME}">
                </div>
                <h3>Witaj! Jestem ${MENTOR_NAME}</h3>
                <p class="welcome-prompt">Jak mogę Ci dzisiaj pomóc?</p>
            </div>
        `;
    }
}

// Eksport czatu
function exportChat() {
    const messages = document.querySelectorAll('.message');
    let exportText = `Rozmowa z ${MENTOR_NAME}\n`;
    exportText += `Data: ${new Date().toLocaleDateString('pl-PL')}\n\n`;
    
    messages.forEach(message => {
        const isUser = message.classList.contains('user');
        const sender = isUser ? 'Ty' : MENTOR_NAME;
        const text = message.querySelector('.message-bubble').textContent;
        const time = message.querySelector('.message-time').textContent;
        
        exportText += `[${time}] ${sender}: ${text}\n`;
    });
    
    // Pobieranie pliku
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${MENTOR_NAME}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Sidebar z zadaniami
function toggleSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    sidebar.classList.toggle('open');
    
    if (sidebar.classList.contains('open')) {
        loadQuickTasks();
    }
}

// Ładowanie szybkich zadań
async function loadQuickTasks() {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        
        const quickTasksDiv = document.getElementById('quickTasks');
        quickTasksDiv.innerHTML = '';
        
        const incompleteTasks = tasks.filter(task => !task.is_completed).slice(0, 5);
        
        if (incompleteTasks.length === 0) {
            quickTasksDiv.innerHTML = '<p>Brak aktywnych zadań</p>';
            return;
        }
        
        incompleteTasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'quick-task';
            taskDiv.innerHTML = `
                <div class="task-content">
                    <h4>${task.title}</h4>
                    <p>${task.description || 'Brak opisu'}</p>
                </div>
                <button onclick="completeTask(${task.id})" class="complete-btn">
                    <i class="fas fa-check"></i>
                </button>
            `;
            quickTasksDiv.appendChild(taskDiv);
        });
        
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Oznaczanie zadania jako ukończone
async function completeTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/complete`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            loadQuickTasks(); // Odśwież listę zadań
            showNotification('Zadanie ukończone!', 'success');
        }
    } catch (error) {
        console.error('Error completing task:', error);
        showNotification('Błąd podczas oznaczania zadania', 'error');
    }
}

// Tworzenie szybkiego zadania
function createQuickTask() {
    const title = prompt('Tytuł zadania:');
    if (!title) return;
    
    const description = prompt('Opis zadania (opcjonalnie):');
    
    createTask(title, description);
}

// Tworzenie zadania
async function createTask(title, description = '') {
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                description: description,
                mentor_id: MENTOR_ID
            })
        });
        
        if (response.ok) {
            loadQuickTasks();
            showNotification('Zadanie utworzone!', 'success');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Błąd podczas tworzenia zadania', 'error');
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
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        default:
            notification.style.background = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Obsługa urządzeń mobilnych
document.addEventListener('touchstart', function() {
    // Ukryj klawiaturę po dotknięciu obszaru czatu
}, { passive: true });

// Śledzenie aktywności użytkownika
let lastActivity = Date.now();

document.addEventListener('click', () => lastActivity = Date.now());
document.addEventListener('keypress', () => lastActivity = Date.now());

// Automatyczne odświeżanie połączenia (opcjonalne)
setInterval(() => {
    if (Date.now() - lastActivity < 300000) { // 5 minut
        // Ping serwera jeśli potrzebne
    }
}, 60000);
