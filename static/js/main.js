// Zmienne globalne
let currentMentorIndex = 0;
let totalMentors = 0;

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    const mentorCards = document.querySelectorAll('.mentor-card');
    totalMentors = mentorCards.length;
    
    if (totalMentors > 0) {
        updateCarousel();
        updateIndicators();
    }
    
    // Auto-przesuwanie karuzeli (opcjonalne)
    // setInterval(nextMentor, 8000);
});

// Funkcja przesuwania do następnego mentora
function nextMentor() {
    currentMentorIndex = (currentMentorIndex + 1) % totalMentors;
    updateCarousel();
    updateIndicators();
}

// Funkcja przesuwania do poprzedniego mentora
function previousMentor() {
    currentMentorIndex = (currentMentorIndex - 1 + totalMentors) % totalMentors;
    updateCarousel();
    updateIndicators();
}

// Funkcja przechodzenia do konkretnego mentora
function goToMentor(index) {
    currentMentorIndex = index;
    updateCarousel();
    updateIndicators();
}

// Aktualizacja pozycji karuzeli
function updateCarousel() {
    const mentorCards = document.getElementById('mentorCards');
    if (!mentorCards) return;
    
    const cardWidth = 350; // szerokość karty + gap
    const offset = -currentMentorIndex * (cardWidth + 30);
    mentorCards.style.transform = `translateX(${offset}px)`;
}

// Aktualizacja wskaźników
function updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentMentorIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Funkcja rozpoczęcia czatu z mentorem
function startChat(mentorId) {
    window.location.href = `/chat?mentor_id=${mentorId}`;
}

// Obsługa gestów na urządzeniach dotykowych
let startX = 0;
let startY = 0;
let isDragging = false;

document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
});

document.addEventListener('touchmove', function(e) {
    if (!startX || !startY) return;
    
    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;
    
    let diffX = startX - currentX;
    let diffY = startY - currentY;
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        isDragging = true;
        if (diffX > 0) {
            // Swipe left - next mentor
            nextMentor();
        } else {
            // Swipe right - previous mentor
            previousMentor();
        }
        startX = 0;
        startY = 0;
    }
});

// Obsługa klawiatury
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        previousMentor();
    } else if (e.key === 'ArrowRight') {
        nextMentor();
    } else if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        if (index < totalMentors) {
            goToMentor(index);
        }
    }
});

// Funkcje nawigacyjne
function navigateToTasks() {
    window.location.href = '/tasks';
}

function navigateToCalendar() {
    window.location.href = '/calendar';
}

function navigateToNotes() {
    window.location.href = '/notes';
}

// Funkcja aktualizacji aktywnego linka nawigacji
function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Smooth scrolling dla linków wewnętrznych
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Animacje przy przewijaniu
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .step');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Inicjalizacja animacji po załadowaniu
document.addEventListener('DOMContentLoaded', function() {
    updateActiveNavLink();
    animateOnScroll();
});

// Resize handler dla responsywności karuzeli
window.addEventListener('resize', function() {
    updateCarousel();
});

// Obsługa formularzy (do wykorzystania w przyszłości)
function handleFormSubmit(formId, callback) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (callback) callback(form);
        });
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Tutaj można dodać system powiadomień
    console.log(`${type.toUpperCase()}: ${message}`);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Export funkcji dla innych skryptów
window.MentorApp = {
    nextMentor,
    previousMentor,
    goToMentor,
    startChat,
    showNotification,
    formatDate
};
