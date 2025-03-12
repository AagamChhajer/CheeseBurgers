from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from datetime import datetime
from prisma import Prisma
import jwt

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

db = Prisma()
db.connect()

@app.route('/get_logs', methods=['GET'])
def get_logs():
    logs = db.eventlog.find_many()
    return jsonify([{ "timestamp": log.timestamp, "event": log.eventType, "details": log.details } for log in logs])

@socketio.on('log_event')
def handle_event(data):
    try:
        user = db.user.find_first(where={"username": data.get("username")})
        if not user:
            user = db.user.create({"username": data["username"]})
        
        timestamp = datetime.now()
        db.eventlog.create({
            "userId": user.id,
            "timestamp": timestamp,
            "eventType": data["event"],
            "details": str(data.get("details", None))
        })
        print("Logged Event:", data)
    except Exception as e:
        print("Unexpected Error:", e)

def log_event(user_id, event, details=None):
    try:
        timestamp = datetime.now()
        db.eventlog.create({
            "userId": user_id,
            "timestamp": timestamp,
            "eventType": event,
            "details": str(details)
        })
        print("[LOG]", event, details)
    except Exception as e:
        print("Unexpected Error:", e)

@app.route('/log_mouse_movement', methods=['POST'])
def log_mouse_movement():
    data = request.json
    try:
        db.mousemovement.create({
            "userId": data["userId"],
            "timestamp": datetime.now(),
            "xPos": data["x"],
            "yPos": data["y"]
        })
        return jsonify({"message": "Mouse movement logged"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/log_tab_switch', methods=['POST'])
def log_tab_switch():
    data = request.json
    try:
        db.tabswitch.create({
            "userId": data["userId"],
            "timestamp": datetime.now(),
            "tabUrl": data["url"]
        })
        return jsonify({"message": "Tab switch logged"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/log_keystroke', methods=['POST'])
def log_keystroke():
    data = request.json
    try:
        db.keystroke.create({
            "userId": data["userId"],
            "timestamp": datetime.now(),
            "keyPressed": data["key"]
        })
        return jsonify({"message": "Keystroke logged"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Selenium bot code (kept commented for future use)
# def start_selenium_bot():
#     ... (same as before)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    print(data)
    try:
        user = db.user.create({
            "data": {
                "username": data['name'],
                "email": data['email'],
                "password": data['password'],
                "studentId": data.get('studentId'),
                "course": data.get('course')
            }
        })
        
        token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    try:
        user = db.user.find_first(where={"email": data['email'], "password": data['password']})
        if user:
            # token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')
            return jsonify({'token'}), 200
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # threading.Thread(target=start_selenium_bot).start()
    socketio.run(app, debug=True)

db.disconnect()
print("Flask backend setup complete!")
