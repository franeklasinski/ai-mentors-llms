# Aplikacja Mentorska

Twój osobisty zespół wsparcia 24/7 - aplikacja webowa z 4 unikalnimi mentorami AI.

## Funkcjonalności

### 4 Unikalni Mentorzy
- **Anna** - Wspierająca i empatyczna coach życiowa
- **Marek** - Konkretny trener biznesowy  
- **Kasia** - Energiczna motywatorka fitness
- **David** - Bezkompromisowy motywator w stylu Gogginsa

## Mentorzy srednio odpowiadają ponieważ modele są lokalne, projekt zostal stworzony w celu edukacyjnym.

### Główne możliwości
- **Inteligentny chat** - Rozmowy z mentorami o różnych osobowościach
- **Zarządzanie zadaniami** - Automatyczne zapisywanie i śledzenie celów
- **Kalendarz** - Planowanie terminów i przypomnienia
- **Notatki** - Dokumentowanie postępów i przemyśleń
- **Pamięć kontekstu** - Historia rozmów i ciągłość wsparcia

<img width="1470" height="664" alt="Zrzut ekranu 2025-08-5 o 16 23 26" src="https://github.com/user-attachments/assets/01228ed3-5c9d-48e7-904b-1c5d1115e33d" />
<img width="1470" height="873" alt="Zrzut ekranu 2025-08-5 o 16 23 49" src="https://github.com/user-attachments/assets/6481a6ae-800e-4084-b555-82dc4e610aac" />
<img width="1470" height="865" alt="Zrzut ekranu 2025-08-5 o 16 24 03" src="https://github.com/user-attachments/assets/a5857f4c-147b-42f3-baec-75eb9e4e686d" />
<img width="1470" height="956" alt="Zrzut ekranu 2025-08-5 o 16 24 30" src="https://github.com/user-attachments/assets/83cb98a6-1bce-4a0e-bb77-51547da889a3" />
<img width="1470" height="956" alt="Zrzut ekranu 2025-08-5 o 16 24 56" src="https://github.com/user-attachments/assets/1ecc35d1-0e8c-4e69-ae69-f6356d5ee4ff" />
<img width="1470" height="956" alt="Zrzut ekranu 2025-08-5 o 16 25 21" src="https://github.com/user-attachments/assets/56489f1a-00e3-4d68-8a73-34b4eb0daf12" />



## Jak uruchomić

### Wymagania
- Python 3.8+
- Pip

### Instalacja

1. **Aktywuj środowisko wirtualne:**
   ```bash
   source venv/bin/activate  # macOS/Linux
   # lub
   venv\Scripts\activate  # Windows
   ```

2. **Zainstaluj zależności:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Uruchom aplikację:**
   ```bash
   python app.py
   ```

4. **Otwórz przeglądarkę:**
   ```
   http://localhost:5000
   ```

## 📁 Struktura projektu

```
proj/
├── app.py                 # Główny plik Flask
├── requirements.txt       # Zależności Python
├── mentors.db            # Baza danych SQLite (tworzona automatycznie)
├── static/               # Pliki statyczne
│   ├── css/
│   │   ├── style.css     # Główne style
│   │   └── chat.css      # Style dla czatu
│   ├── js/
│   │   ├── main.js       # Główna logika JS
│   │   └── chat.js       # Logika czatu
│   └── images/           # Obrazy i ikony
├── templates/            # Szablony HTML
│   ├── index.html        # Strona główna
│   ├── chat.html         # Interfejs czatu
│   ├── tasks.html        # Zarządzanie zadaniami
│   ├── calendar.html     # Kalendarz
│   └── notes.html        # Notatki
└── .github/
    └── copilot-instructions.md
```

## Jak używać

### 1. Wybierz mentora
Na stronie głównej przejrzyj profile 4 mentorów i wybierz tego, który najlepiej pasuje do Twoich potrzeb.

### 2. Rozpocznij rozmowę
Kliknij "Rozpocznij rozmowę" i pisz jak z chatbotem. Każdy mentor odpowie zgodnie ze swoją unikalną osobowością.

### 3. Zarządzaj zadaniami
Mentorzy automatycznie zapisują ważne zadania. Sprawdzaj je w zakładce "Zadania".

### 4. Śledź postępy
Korzystaj z kalendarza i notatek, aby dokumentować swoją drogę rozwoju.

## Technologie

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Baza danych**: SQLite
- **Style**: Gradientowy design z szklanymi efektami
- **Responsywność**: Pełne wsparcie urządzeń mobilnych

## Design

Aplikacja wykorzystuje nowoczesny design z:
- Gradientowymi tłami
- Efektami szkła (glassmorphism)
- Płynnymi animacjami
- Intuicyjnym interfejsem
- Responsywnym layoutem

## Rozwój

Projekt jest w aktywnym rozwoju

### Struktura kodu:
- Modularny design
- Czytelne komentarze
- Responsywny CSS
- Nowoczesny JavaScript (ES6+)
- RESTful API endpoints

## Kontakt

Jeśli masz pytania lub sugestie, skontaktuj się z twórcą projektu.

---

**Franciszek Łasiński projekt wykonanhy z pomocą github copilot**
