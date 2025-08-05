// Notatki JavaScript

let notes = [];
let currentView = 'grid';
let searchTerm = '';
let selectedCategory = 'all';

// Inicjalizacja notatek
document.addEventListener('DOMContentLoaded', function() {
    initializeNotes();
    loadNotes();
    setupEventListeners();
});

function initializeNotes() {
    setupRichTextEditor();
    updateNotesDisplay();
}

function setupEventListeners() {
    // Wyszukiwanie
    const searchInput = document.getElementById('notesSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            filterAndDisplayNotes();
        });
    }

    // Przycisk "Nowa notatka"
    const openNewNoteBtn = document.getElementById('openNewNoteModal');
    if (openNewNoteBtn) {
        openNewNoteBtn.addEventListener('click', () => openNoteModal());
    }

    // Przełączanie widoków
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            updateNotesDisplay();
        });
    });

    // Formularz dodawania notatki
    const noteForm = document.getElementById('noteForm');
    if (noteForm) {
        noteForm.addEventListener('submit', handleNoteSubmit);
    }

    // Zamykanie modala
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    const cancelBtn = document.getElementById('cancelNoteModal');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    const noteModal = document.getElementById('noteModal');
    if (noteModal) {
        noteModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
    }

    // Filtrowanie kategorii
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            selectedCategory = e.target.value;
            filterAndDisplayNotes();
        });
    }
    });

    // Licznik znaków
    const noteContent = document.getElementById('noteContent');
    noteContent.addEventListener('input', updateCharacterCount);
}

function setupRichTextEditor() {
    const toolbar = document.querySelector('.editor-toolbar');
    const textArea = document.getElementById('noteContent');
    
    // Obsługa przycisków formatowania
    toolbar.addEventListener('click', (e) => {
        if (e.target.classList.contains('editor-btn')) {
            const command = e.target.dataset.command;
            executeFormatCommand(command, textArea);
        }
    });
    
    // Skróty klawiszowe
    textArea.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'b':
                    e.preventDefault();
                    executeFormatCommand('bold', textArea);
                    break;
                case 'i':
                    e.preventDefault();
                    executeFormatCommand('italic', textArea);
                    break;
                case 'u':
                    e.preventDefault();
                    executeFormatCommand('underline', textArea);
                    break;
            }
        }
    });
}

function executeFormatCommand(command, textArea) {
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = textArea.value.substring(start, end);
    
    let formattedText = '';
    
    switch(command) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
        case 'heading':
            formattedText = `# ${selectedText}`;
            break;
        case 'bullet':
            formattedText = `• ${selectedText}`;
            break;
        case 'number':
            formattedText = `1. ${selectedText}`;
            break;
        case 'link':
            const url = prompt('Podaj URL:');
            if (url) {
                formattedText = `[${selectedText || 'Link'}](${url})`;
            } else {
                return;
            }
            break;
        default:
            return;
    }
    
    textArea.value = textArea.value.substring(0, start) + formattedText + textArea.value.substring(end);
    textArea.focus();
    textArea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    
    updateCharacterCount();
}

function updateCharacterCount() {
    const textArea = document.getElementById('noteContent');
    const counter = document.querySelector('.character-counter');
    const length = textArea.value.length;
    const maxLength = 10000;
    
    counter.textContent = `${length}/${maxLength} znaków`;
    
    if (length > maxLength * 0.9) {
        counter.style.color = '#ef4444';
    } else if (length > maxLength * 0.7) {
        counter.style.color = '#f59e0b';
    } else {
        counter.style.color = '#94a3b8';
    }
}

function updateNotesDisplay() {
    const notesGrid = document.getElementById('notesGrid');
    
    if (currentView === 'grid') {
        notesGrid.classList.remove('list-view');
    } else {
        notesGrid.classList.add('list-view');
    }
    
    filterAndDisplayNotes();
}

function filterAndDisplayNotes() {
    let filteredNotes = notes.filter(note => {
        const matchesSearch = searchTerm === '' || 
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        
        const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    displayNotes(filteredNotes);
}

function displayNotes(notesToDisplay) {
    const notesGrid = document.getElementById('notesGrid');
    
    if (notesToDisplay.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-sticky-note"></i>
                </div>
                <h3>Brak notatek</h3>
                <p>${searchTerm || selectedCategory !== 'all' ? 'Nie znaleziono notatek pasujących do kryteriów.' : 'Rozpocznij od utworzenia pierwszej notatki!'}</p>
                ${searchTerm === '' && selectedCategory === 'all' ? '<button class="btn-primary" onclick="openNoteModal()">Dodaj notatkę</button>' : ''}
            </div>
        `;
        return;
    }
    
    notesGrid.innerHTML = notesToDisplay.map(note => createNoteCard(note)).join('');
}

function createNoteCard(note) {
    const createdDate = new Date(note.created_at).toLocaleDateString('pl-PL');
    const updatedDate = note.updated_at ? new Date(note.updated_at).toLocaleDateString('pl-PL') : null;
    
    // Skróć treść do podglądu
    let contentPreview = note.content || '';
    if (contentPreview.length > 150) {
        contentPreview = contentPreview.substring(0, 150) + '...';
    }
    
    // Usuń formatowanie markdown z podglądu
    contentPreview = contentPreview.replace(/[*_#\[\]()]/g, '');
    
    const tags = note.tags ? note.tags.split(',').map(tag => 
        `<span class="note-tag">${tag.trim()}</span>`
    ).join('') : '';
    
    return `
        <div class="note-card ${currentView === 'list' ? 'list-view' : ''}" onclick="openNoteModal(${note.id})">
            <div class="note-header">
                <h3 class="note-title">${note.title}</h3>
                <div class="note-actions">
                    <button class="note-btn edit" onclick="event.stopPropagation(); editNote(${note.id})" title="Edytuj">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="note-btn delete" onclick="event.stopPropagation(); deleteNote(${note.id})" title="Usuń">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="note-content-preview">${contentPreview}</div>
            ${tags ? `<div class="note-tags">${tags}</div>` : ''}
            <div class="note-meta">
                <span class="note-category ${note.category}">${getCategoryLabel(note.category)}</span>
                <span class="note-date">${updatedDate ? `Zaktualizowano ${updatedDate}` : `Utworzono ${createdDate}`}</span>
            </div>
        </div>
    `;
}

function getCategoryLabel(category) {
    const labels = {
        general: 'Ogólne',
        goals: 'Cele',
        progress: 'Postęp',
        insights: 'Spostrzeżenia',
        mentor: 'Mentor',
        personal: 'Osobiste'
    };
    return labels[category] || category;
}

function openNoteModal(noteId = null) {
    const modal = document.getElementById('noteModal');
    const form = document.getElementById('noteForm');
    const title = document.querySelector('.modal h2');
    
    // Reset formularza
    form.reset();
    
    if (noteId) {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            title.textContent = 'Edytuj notatkę';
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').value = note.content || '';
            document.getElementById('noteCategory').value = note.category;
            document.getElementById('noteTags').value = note.tags || '';
            form.dataset.noteId = noteId;
        }
    } else {
        title.textContent = 'Nowa notatka';
        delete form.dataset.noteId;
    }
    
    modal.style.display = 'flex';
    document.getElementById('noteTitle').focus();
    updateCharacterCount();
}

function closeModal() {
    document.getElementById('noteModal').style.display = 'none';
}

function handleNoteSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const noteData = {
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
        tags: formData.get('tags')
    };
    
    // Walidacja
    if (!noteData.title.trim()) {
        showNotification('Proszę wprowadzić tytuł notatki', 'error');
        return;
    }
    
    const noteId = e.target.dataset.noteId;
    
    if (noteId) {
        updateNote(noteId, noteData);
    } else {
        addNote(noteData);
    }
}

function addNote(noteData) {
    fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Notatka została dodana!', 'success');
            loadNotes();
            closeModal();
        } else {
            showNotification('Błąd podczas dodawania notatki', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Błąd połączenia', 'error');
    });
}

function updateNote(noteId, noteData) {
    fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Notatka została zaktualizowana!', 'success');
            loadNotes();
            closeModal();
        } else {
            showNotification('Błąd podczas aktualizacji notatki', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Błąd połączenia', 'error');
    });
}

function editNote(noteId) {
    openNoteModal(noteId);
}

function deleteNote(noteId) {
    if (!confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
        return;
    }
    
    fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Notatka została usunięta!', 'success');
            loadNotes();
        } else {
            showNotification('Błąd podczas usuwania notatki', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Błąd połączenia', 'error');
    });
}

function loadNotes() {
    fetch('/api/notes')
    .then(response => response.json())
    .then(data => {
        notes = data.notes || [];
        filterAndDisplayNotes();
        updateNotesStats();
    })
    .catch(error => {
        console.error('Error loading notes:', error);
        showNotification('Błąd podczas ładowania notatek', 'error');
    });
}

function updateNotesStats() {
    const stats = {
        total: notes.length,
        categories: {}
    };
    
    notes.forEach(note => {
        if (stats.categories[note.category]) {
            stats.categories[note.category]++;
        } else {
            stats.categories[note.category] = 1;
        }
    });
    
    // Możliwość dodania statystyk do interfejsu
    console.log('Notes stats:', stats);
}

function exportNotes() {
    const exportData = {
        exported_at: new Date().toISOString(),
        total_notes: notes.length,
        notes: notes
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `notatki_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Notatki zostały wyeksportowane!', 'success');
}

function importNotes(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.notes && Array.isArray(data.notes)) {
                // Wyślij notatki do serwera
                fetch('/api/notes/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ notes: data.notes })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        showNotification(`Zaimportowano ${result.imported} notatek!`, 'success');
                        loadNotes();
                    } else {
                        showNotification('Błąd podczas importu notatek', 'error');
                    }
                });
            } else {
                showNotification('Nieprawidłowy format pliku', 'error');
            }
        } catch (error) {
            showNotification('Błąd podczas odczytywania pliku', 'error');
        }
    };
    reader.readAsText(file);
}

function searchNotes(query) {
    searchTerm = query.toLowerCase();
    document.getElementById('notesSearch').value = query;
    filterAndDisplayNotes();
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
window.openNoteModal = openNoteModal;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.exportNotes = exportNotes;
window.importNotes = importNotes;
window.searchNotes = searchNotes;
