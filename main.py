from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
import time
import psycopg2
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import threading
import random
import pyautogui
from datetime import datetime
import jwt  # Add this for authentication

# import loguru

# logging = loguru.logger
# logging.add("logs.log")
#Hello World

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Add JWT secret key
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production

# Database Configuration
DB_CONN = psycopg2.connect(
    dbname="shield", user="pranay", password="1234", host="localhost", port="5432")
DB_CURSOR = DB_CONN.cursor()

# Improved Database Schema
DB_CURSOR.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        student_id VARCHAR(255),
        course VARCHAR(255)
    )
''')

DB_CURSOR.execute('''
    CREATE TABLE IF NOT EXISTS event_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        event_type VARCHAR(255) NOT NULL,
        details TEXT
    )
''')

DB_CURSOR.execute('''
    CREATE TABLE IF NOT EXISTS mouse_movements (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        x_pos INT,
        y_pos INT
    )
''')

DB_CURSOR.execute('''
    CREATE TABLE IF NOT EXISTS tab_switches (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tab_url TEXT
    )
''')

DB_CURSOR.execute('''
    CREATE TABLE IF NOT EXISTS keystrokes (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        key_pressed TEXT
    )
''')

DB_CONN.commit()

@app.route('/')
def index():
    return render_template('exam.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/get_logs', methods=['GET'])
def get_logs():
    DB_CURSOR.execute("SELECT timestamp, event_type, details FROM event_logs")
    logs = DB_CURSOR.fetchall()
    return jsonify([{ "timestamp": log[0], "event": log[1], "details": log[2] } for log in logs])

@socketio.on('log_event')
def handle_event(data):
    try:
        timestamp = datetime.now()
        DB_CURSOR.execute("INSERT INTO event_logs (timestamp, event_type, details) VALUES (%s, %s, %s)",
                          (timestamp, data["event"], str(data.get("details", None))))
        DB_CONN.commit()
        print("Logged Event:", data)
    except psycopg2.Error as e:
        DB_CONN.rollback()
        print("Database Error:", e.pgerror)
    except Exception as e:
        print("Unexpected Error:", e)

def log_event(event, details=None):
    try:
        timestamp = datetime.now()
        DB_CURSOR.execute("INSERT INTO event_logs (timestamp, event_type, details) VALUES (%s, %s, %s)",
                          (timestamp, event, str(details)))
        DB_CONN.commit()
        print("[LOG]", event, details)
    except psycopg2.Error as e:
        DB_CONN.rollback()
        print("Database Error:", e.pgerror)
    except Exception as e:
        print("Unexpected Error:", e)

def start_selenium_bot():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")  # Ensure fullscreen mode
    driver = webdriver.Chrome(options=options)
    driver.get("http://127.0.0.1:5000/")
    log_event("Exam Page Opened")
    
    for _ in range(10):
        x, y = random.randint(200, 1200), random.randint(150, 700)  # Avoid screen edges
        pyautogui.moveTo(x, y, duration=random.uniform(0.5, 2.0))  # More natural movement
        log_event("Cursor Movement", {"x": x, "y": y})
        time.sleep(random.uniform(0.5, 2))
    
    question_element = driver.find_element(By.TAG_NAME, "p")
    pyautogui.moveTo(question_element.location['x'] + 5, question_element.location['y'] + 5, duration=1)
    pyautogui.doubleClick()
    pyautogui.hotkey('ctrl', 'c')
    log_event("Copied Question", {"question": question_element.text})
    time.sleep(random.uniform(1, 3))
    
    driver.execute_script("window.open('https://chat.openai.com/','_blank');")
    driver.switch_to.window(driver.window_handles[-1])
    log_event("Tab Switched", {"url": "https://chat.openai.com/"})
    time.sleep(random.uniform(3, 5))
    
    chat_input = driver.find_element(By.TAG_NAME, "textarea")
    pyautogui.moveTo(chat_input.location['x'] + 5, chat_input.location['y'] + 5, duration=1)
    pyautogui.click()
    pyautogui.hotkey('ctrl', 'v')
    pyautogui.press('enter')
    log_event("Pasted Question in Chatbot")
    time.sleep(random.uniform(5, 8))
    
    driver.switch_to.window(driver.window_handles[0])
    log_event("Switched Back to Exam Tab")
    answer_box = driver.find_element(By.ID, "answer")
    pyautogui.moveTo(answer_box.location['x'] + 5, answer_box.location['y'] + 5, duration=1)
    pyautogui.click()
    pyautogui.hotkey('ctrl', 'v')
    pyautogui.press(Keys.RETURN)
    log_event("Entered Answer in Exam")
    time.sleep(random.uniform(2, 4))
    
    print("Selenium bot completed AI-assisted cheating interaction. Closing bot.")
    driver.quit()
    log_event("Bot Closed")

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    try:
        DB_CURSOR.execute(
            "INSERT INTO users (name, email, password, student_id, course) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (data['name'], data['email'], data['password'], data['studentId'], data['course'])
        )
        user_id = DB_CURSOR.fetchone()[0]
        DB_CONN.commit()
        
        token = jwt.encode({'user_id': user_id}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token}), 201
    except Exception as e:
        DB_CONN.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    DB_CURSOR.execute("SELECT id FROM users WHERE email = %s AND password = %s", 
                     (data['email'], data['password']))
    user = DB_CURSOR.fetchone()
    
    if user:
        token = jwt.encode({'user_id': user[0]}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

if __name__ == '__main__':
    threading.Thread(target=start_selenium_bot).start()
    socketio.run(app, debug=True)

print("Exam environment setup complete!")
