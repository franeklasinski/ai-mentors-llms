# Aplikacja Mentorska 🧠💡

Twój osobisty zespół wsparcia 24/7 - aplikacja webowa z 4 unikalnimi mentorami AI.

## 🌟 Funkcjonalności

### 4 Unikalni Mentorzy
- **Anna** - Wspierająca i empatyczna coach życiowa
- **Marek** - Konkretny trener biznesowy  
- **Kasia** - Energiczna motywatorka fitness
- **David** - Bezkompromisowy motywator w stylu Gogginsa

### Główne możliwości
- 💬 **Inteligentny chat** - Rozmowy z mentorami o różnych osobowościach
- ✅ **Zarządzanie zadaniami** - Automatyczne zapisywanie i śledzenie celów
- 📅 **Kalendarz** - Planowanie terminów i przypomnienia
- 📝 **Notatki** - Dokumentowanie postępów i przemyśleń
- 🧠 **Pamięć kontekstu** - Historia rozmów i ciągłość wsparcia

## 🚀 Jak uruchomić

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

## 🎯 Jak używać

### 1. Wybierz mentora
Na stronie głównej przejrzyj profile 4 mentorów i wybierz tego, który najlepiej pasuje do Twoich potrzeb.

### 2. Rozpocznij rozmowę
Kliknij "Rozpocznij rozmowę" i pisz jak z chatbotem. Każdy mentor odpowie zgodnie ze swoją unikalną osobowością.

### 3. Zarządzaj zadaniami
Mentorzy automatycznie zapisują ważne zadania. Sprawdzaj je w zakładce "Zadania".

### 4. Śledź postępy
Korzystaj z kalendarza i notatek, aby dokumentować swoją drogę rozwoju.

## 🔧 Technologie

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Baza danych**: SQLite
- **Style**: Gradientowy design z szklanymi efektami
- **Responsywność**: Pełne wsparcie urządzeń mobilnych

## 🎨 Design

Aplikacja wykorzystuje nowoczesny design z:
- Gradientowymi tłami
- Efektami szkła (glassmorphism)
- Płynnymi animacjami
- Intuicyjnym interfejsem
- Responsywnym layoutem

## 🚧 Roadmapa

### Najbliższe funkcjonalności:
- [ ] Integracja z API modeli językowych (OpenAI/Anthropic)
- [ ] Pełny kalendarz z planowaniem
- [ ] Edytor notatek z formatowaniem
- [ ] Eksport danych
- [ ] Powiadomienia push
- [ ] Czat głosowy i wideo
- [ ] Tryb ciemny
- [ ] Synchronizacja między urządzeniami

### Długoterminowe cele:
- [ ] Aplikacja mobilna
- [ ] Integracje z zewnętrznymi kalendarzami
- [ ] Zaawansowana analityka postępów
- [ ] Personalizowane raporty
- [ ] Społeczność użytkowników

## 🤝 Rozwój

Projekt jest w aktywnym rozwoju. Sugestie i feedback są mile widziane!

### Struktura kodu:
- Modularny design
- Czytelne komentarze
- Responsywny CSS
- Nowoczesny JavaScript (ES6+)
- RESTful API endpoints

## 📝 Licencja

Ten projekt jest przeznaczony do celów edukacyjnych i rozwoju osobistego.

## 🎯 Kontakt

Jeśli masz pytania lub sugestie, skontaktuj się z twórcą projektu.

---

**Rozpocznij swoją podróż rozwoju osobistego już dziś! 🌟**
