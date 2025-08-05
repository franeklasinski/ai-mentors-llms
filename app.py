from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
import requests
import json
import logging

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mentors.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Utworzenie folderu instance jeśli nie istnieje
os.makedirs('instance', exist_ok=True)

db = SQLAlchemy(app)

# Modele bazy danych
class Mentor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    personality = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    
class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentor.id'), nullable=False)
    user_message = db.Column(db.Text, nullable=False)
    mentor_response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    mentor = db.relationship('Mentor', backref=db.backref('messages', lazy=True))

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(20), default='pending')
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentor.id'))
    
    mentor = db.relationship('Mentor', backref=db.backref('tasks', lazy=True))

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    category = db.Column(db.String(50), default='general')
    tags = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime)
    event_type = db.Column(db.String(50), default='meeting')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Konfiguracja modeli językowych
LANGUAGE_MODELS = {
    'ollama': {
        'url': 'http://localhost:11434/api/generate',
        'model': 'llama3.2:latest',  # Model który na pewno istnieje
        'backup_models': ['llama2:latest']  # Uproszczona lista backup
    }
}

def call_ollama(prompt, model=None, max_retries=3, mentor_name=None):
    """Wywołanie API Ollama z obsługą błędów i fallback"""
    
    if model is None:
        model = LANGUAGE_MODELS['ollama']['model']
    
    url = LANGUAGE_MODELS['ollama']['url']
    backup_models = LANGUAGE_MODELS['ollama']['backup_models']
    
    # Dodaj identyfikację mentora do promptu
    if mentor_name:
        prompt = f"[MENTOR: {mentor_name}]\n{prompt}"
    
    data = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 200,  # Krótsze odpowiedzi
            "repeat_penalty": 1.1,
            "num_ctx": 1024  # Mniejszy kontekst = brak pamięci
        }
    }
    
    for attempt in range(max_retries + 1):
        try:
            logger.info(f"Próba {attempt + 1}: Wywołanie Ollama z modelem {model}")
            
            response = requests.post(url, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'response' in result:
                    logger.info(f"Sukces: Otrzymano odpowiedź od {model}")
                    return result['response'].strip()
                else:
                    logger.warning(f"Brak pola 'response' w odpowiedzi: {result}")
            else:
                logger.warning(f"Błąd HTTP {response.status_code}: {response.text}")
                
        except requests.exceptions.ConnectionError:
            logger.warning(f"Błąd połączenia z Ollama (próba {attempt + 1})")
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout połączenia z Ollama (próba {attempt + 1})")
        except Exception as e:
            logger.error(f"Nieoczekiwany błąd: {str(e)}")
        
        # Próba z backup modelami przy błędach
        if attempt == max_retries - 1:
            for backup_model in backup_models:
                if backup_model != model:
                    logger.info(f"Przełączanie na backup model: {backup_model}")
                    # Próba z backup modelem
                    data["model"] = backup_model
                    try:
                        response = requests.post(url, json=data, timeout=30)
                        if response.status_code == 200:
                            result = response.json()
                            if 'response' in result:
                                logger.info(f"Sukces z backup modelem: {backup_model}")
                                return result['response'].strip()
                    except Exception as e:
                        logger.warning(f"Backup model {backup_model} też nie działa: {str(e)}")
                        continue
                    break
    
    # Fallback jeśli wszystko zawiedzie
    logger.error("Wszystkie próby nieudane, używam fallback response")
    
    # Fallback responses dla każdego mentora
    fallback_responses = {
        'Anna': "Przepraszam za problemy techniczne. Spróbuj zadać pytanie ponownie - jestem tutaj aby Ci pomóc w rozwoju osobistym.",
        'Marek': "Mam problemy z połączeniem. Spróbuj ponownie za chwilę - chętnie pomogę Ci z treningiem i dietą.",
        'Kasia': "Chwilowe problemy techniczne. Odśwież stronę i spróbuj ponownie - jestem gotowa na rozmowę o biznesie!",
        'David': "System ma problemy, ale to nie powód do poddawania się. Spróbuj ponownie - razem przełamiemy każdą barierę!"
    }
    
    # Sprawdź który mentor odpowiada na podstawie kontekstu
    for mentor_name in fallback_responses.keys():
        if mentor_name in prompt:
            return fallback_responses[mentor_name]
    
    return "Przepraszam, mam obecnie problemy techniczne. Spróbuj ponownie za chwilę."

def generate_mentor_response(mentor_name, user_message, conversation_history=None):
    """Generowanie odpowiedzi mentora przy użyciu modelu językowego"""
    
    # Definicje osobowości mentorów - proste i jasne
    mentor_personalities = {
        'Anna': {
            'prompt_prefix': """Jesteś Anną - psychologiem i ekspertką od rozwoju osobistego. 
Jesteś ciepła, wspierająca i pomagasz ludziom w rozwoju. Dajesz konkretne porady psychologiczne.""",
            'style': 'ciepła psycholog'
        },
        'Marek': {
            'prompt_prefix': """Jesteś Markiem - trenerem personalnym i ekspertem fitness.
Jesteś konkretny, praktyczny i skupiony na wynikach. Dajesz porady treningowe i żywieniowe.""",
            'style': 'konkretny trener'
        },
        'Kasia': {
            'prompt_prefix': """Jesteś Kasią - business coach i ekspertką od produktywności.
Jesteś energiczna, motywująca i nastawiona na sukces. Pomagasz w biznesie i produktywności.""",
            'style': 'energiczna coach'
        },
        'David': {
            'prompt_prefix': """Jesteś Davidem - mental coach w stylu David Goggins.
Jesteś bezpośredni, wymagający i nie przyjmujesz wymówek. Motywujesz przez wyzwania.""",
            'style': 'twardy motywator'
        }
    }
    
    if mentor_name not in mentor_personalities:
        mentor_name = 'Anna'  # Default fallback
    
    mentor_profile = mentor_personalities[mentor_name]
    
    # Konstrukcja pełnego promptu - prosty i bez pamięci
    full_prompt = f"""{mentor_profile['prompt_prefix']}

AKTUALNE PYTANIE: "{user_message}"

INSTRUKCJE:
1. Odpowiedz jako {mentor_name} w swoim stylu
2. Skoncentruj się tylko na tym pytaniu (ignoruj historię)
3. Maksymalnie 3-4 zdania
4. Polski język, konkretnie i pomocnie

{mentor_name}:"""

    return call_ollama(full_prompt, mentor_name=mentor_name)

# Inicjalizacja bazy danych
def init_db():
    """Inicjalizacja bazy danych z danymi mentorów"""
    try:
        db.create_all()
        
        # Sprawdź czy mentorowie już istnieją
        if Mentor.query.count() == 0:
            mentors_data = [
                {
                    'name': 'Anna',
                    'personality': 'Ciepła i wspierająca mentorka skupiająca się na rozwoju osobistym',
                    'description': 'Specjalistka od rozwoju osobistego i równowagi życiowej. Anna pomoże Ci znaleźć wewnętrzny spokój i harmonię.',
                    'image': 'anna.jpg',
                    'specialization': 'Rozwój osobisty i well-being'
                },
                {
                    'name': 'Marek',
                    'personality': 'Konkretny i rzeczowy trener skupiony na celach zawodowych',
                    'description': 'Ekspert od produktywności i celów zawodowych. Marek pomoże Ci osiągnąć sukces w karierze.',
                    'image': 'marek.jpg',
                    'specialization': 'Kariera i produktywność'
                },
                {
                    'name': 'Kasia',
                    'personality': 'Energiczna motywatorka pomagająca przełamywać bariery',
                    'description': 'Coach życiowa pełna energii. Kasia zmotywuje Cię do działania i przełamania ograniczeń.',
                    'image': 'kasia.jpg',
                    'specialization': 'Motywacja i przełamywanie barier'
                },
                {
                    'name': 'David',
                    'personality': 'Bezkompromisowy motywator w stylu Gogginsa',
                    'description': 'Hardcore motywator który nie przyjmuje wymówek. David pomoże Ci przekroczyć własne granice.',
                    'image': 'david.jpg',
                    'specialization': 'Mental toughness i self-discipline'
                }
            ]
            
            for mentor_data in mentors_data:
                mentor = Mentor(**mentor_data)
                db.session.add(mentor)
            
            db.session.commit()
            logger.info("Mentorowie zostali dodani do bazy danych")
        
    except Exception as e:
        logger.error(f"Błąd podczas inicjalizacji bazy danych: {str(e)}")
        db.session.rollback()

# Routes
@app.route('/')
def index():
    mentors = Mentor.query.all()
    return render_template('index.html', mentors=mentors)

@app.route('/chat')
def chat():
    mentor_id = request.args.get('mentor_id', 1, type=int)
    mentor = Mentor.query.get_or_404(mentor_id)
    
    # Pobierz historię rozmów
    messages = ChatMessage.query.filter_by(mentor_id=mentor_id).order_by(ChatMessage.timestamp).all()
    
    return render_template('chat.html', mentor=mentor, messages=messages)

@app.route('/tasks')
def tasks():
    return render_template('tasks.html')

@app.route('/calendar')
def calendar():
    return render_template('calendar.html')

@app.route('/notes')
def notes():
    return render_template('notes.html')

# API Routes
@app.route('/api/health')
def health_check():
    """Endpoint sprawdzający status aplikacji i Ollama"""
    try:
        # Test połączenia z Ollama
        response = requests.get('http://localhost:11434/api/tags', timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            model_names = [m['name'] for m in models]
            
            return jsonify({
                'status': 'healthy',
                'ollama_status': 'connected',
                'available_models': model_names,
                'current_model': LANGUAGE_MODELS['ollama']['model']
            })
        else:
            return jsonify({
                'status': 'degraded',
                'ollama_status': 'error',
                'error': f'HTTP {response.status_code}'
            })
            
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'ollama_status': 'disconnected',
            'error': str(e)
        })

@app.route('/api/chat', methods=['POST'])
def api_chat():
    try:
        data = request.get_json()
        mentor_id = data.get('mentor_id')
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'success': False, 'error': 'Wiadomość nie może być pusta'})
        
        mentor = Mentor.query.get(mentor_id)
        if not mentor:
            return jsonify({'success': False, 'error': 'Mentor nie został znaleziony'})
        
        # Generuj odpowiedź używając modelu językowego - bez kontekstu
        mentor_response = generate_mentor_response(
            mentor.name, 
            user_message, 
            None  # Brak historii - każde pytanie jest nowe
        )
        
        # Zapisz wiadomość do bazy danych
        chat_message = ChatMessage(
            mentor_id=mentor_id,
            user_message=user_message,
            mentor_response=mentor_response
        )
        db.session.add(chat_message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'response': mentor_response,
            'timestamp': chat_message.timestamp.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Błąd w API chat: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Wystąpił błąd serwera'})

@app.route('/api/tasks', methods=['GET', 'POST'])
def api_tasks():
    if request.method == 'GET':
        tasks = Task.query.order_by(Task.created_at.desc()).all()
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'priority': task.priority,
                'status': task.status,
                'is_completed': task.status == 'completed',  # Dodaj is_completed dla frontend
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'created_at': task.created_at.isoformat(),
                'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                'mentor_id': task.mentor_id
            })
        return jsonify({'success': True, 'tasks': tasks_data})
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            task = Task(
                title=data.get('title'),
                description=data.get('description', ''),
                priority=data.get('priority', 'medium'),
                due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
                mentor_id=data.get('mentor_id')
            )
            
            db.session.add(task)
            db.session.commit()
            
            return jsonify({'success': True, 'task_id': task.id})
            
        except Exception as e:
            logger.error(f"Błąd przy dodawaniu zadania: {str(e)}")
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Błąd podczas dodawania zadania'})

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
def api_task_detail(task_id):
    task = Task.query.get_or_404(task_id)
    
    if request.method == 'PUT':
        try:
            data = request.get_json()
            
            task.title = data.get('title', task.title)
            task.description = data.get('description', task.description)
            task.priority = data.get('priority', task.priority)
            task.status = data.get('status', task.status)
            
            if data.get('due_date'):
                task.due_date = datetime.fromisoformat(data['due_date'])
            
            if data.get('status') == 'completed' and not task.completed_at:
                task.completed_at = datetime.utcnow()
            elif data.get('status') != 'completed':
                task.completed_at = None
                
            db.session.commit()
            return jsonify({'success': True})
            
        except Exception as e:
            logger.error(f"Błąd przy aktualizacji zadania: {str(e)}")
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Błąd podczas aktualizacji'})
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(task)
            db.session.commit()
            return jsonify({'success': True})
            
        except Exception as e:
            logger.error(f"Błąd przy usuwaniu zadania: {str(e)}")
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Błąd podczas usuwania'})

@app.route('/api/tasks/<int:task_id>/complete', methods=['PUT'])
def api_task_complete(task_id):
    """Endpoint dla oznaczania zadania jako ukończone"""
    try:
        task = Task.query.get_or_404(task_id)
        task.status = 'completed'
        task.completed_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Błąd przy oznaczaniu zadania jako ukończone: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Błąd podczas aktualizacji'})

@app.route('/api/notes', methods=['GET', 'POST'])
def api_notes():
    if request.method == 'GET':
        notes = Note.query.order_by(Note.updated_at.desc()).all()
        notes_data = []
        for note in notes:
            notes_data.append({
                'id': note.id,
                'title': note.title,
                'content': note.content,
                'category': note.category,
                'tags': note.tags,
                'created_at': note.created_at.isoformat(),
                'updated_at': note.updated_at.isoformat()
            })
        return jsonify({'success': True, 'notes': notes_data})
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            note = Note(
                title=data.get('title'),
                content=data.get('content', ''),
                category=data.get('category', 'general'),
                tags=data.get('tags', '')
            )
            
            db.session.add(note)
            db.session.commit()
            
            return jsonify({'success': True, 'note_id': note.id})
            
        except Exception as e:
            logger.error(f"Błąd przy dodawaniu notatki: {str(e)}")
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Błąd podczas dodawania notatki'})

@app.route('/api/notes/<int:note_id>', methods=['PUT', 'DELETE'])
def api_note_detail(note_id):
    note = Note.query.get_or_404(note_id)
    
    if request.method == 'PUT':
        try:
            data = request.get_json()
            
            note.title = data.get('title', note.title)
            note.content = data.get('content', note.content)
            note.category = data.get('category', note.category)
            note.tags = data.get('tags', note.tags)
            note.updated_at = datetime.utcnow()
                
            db.session.commit()
            return jsonify({'success': True})
            
        except Exception as e:
            logger.error(f"Błąd przy aktualizacji notatki: {str(e)}")
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Błąd podczas aktualizacji'})
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(note)
            db.session.commit()
            return jsonify({'success': True})
            
        except Exception as e:
            logger.error(f"Błąd przy usuwaniu notatki: {str(e)}")
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Błąd podczas usuwania'})

@app.route('/api/events', methods=['GET', 'POST'])
def api_events():
    if request.method == 'GET':
        events = Event.query.order_by(Event.start_date).all()
        events_data = []
        for event in events:
            events_data.append({
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'start_date': event.start_date.isoformat(),
                'end_date': event.end_date.isoformat() if event.end_date else None,
                'event_type': event.event_type,
                'created_at': event.created_at.isoformat()
            })
        return jsonify({'success': True, 'events': events_data})
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            event = Event(
                title=data.get('title'),
                description=data.get('description', ''),
                start_date=datetime.fromisoformat(data['start_date']),
                end_date=datetime.fromisoformat(data['end_date']) if data.get('end_date') else None,
                event_type=data.get('event_type', 'meeting')
            )
            
            db.session.add(event)
            db.session.commit()
            
            return jsonify({'success': True, 'event_id': event.id})
            
        except Exception as e:
            logger.error(f"Błąd przy dodawaniu wydarzenia: {str(e)}")
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Błąd podczas dodawania wydarzenia'})

@app.route('/api/health')
def api_health():
    """Endpoint do sprawdzania zdrowia aplikacji i dostępności Ollama"""
    health_status = {
        'app': 'healthy',
        'database': 'unknown',
        'ollama': 'unknown'
    }
    
    # Sprawdź bazę danych
    try:
        db.session.execute('SELECT 1')
        health_status['database'] = 'healthy'
    except Exception as e:
        health_status['database'] = f'error: {str(e)}'
    
    # Sprawdź Ollama
    try:
        response = requests.get('http://localhost:11434/api/tags', timeout=5)
        if response.status_code == 200:
            health_status['ollama'] = 'healthy'
            models = response.json()
            health_status['available_models'] = [model.get('name', 'unknown') for model in models.get('models', [])]
        else:
            health_status['ollama'] = f'http_error: {response.status_code}'
    except Exception as e:
        health_status['ollama'] = f'connection_error: {str(e)}'
    
    return jsonify(health_status)

if __name__ == '__main__':
    with app.app_context():
        init_db()
    
    logger.info("Uruchamianie aplikacji Flask...")
    logger.info("Sprawdź status Ollama: http://localhost:5002/api/health")
    
    app.run(debug=True, host='0.0.0.0', port=5002)
