from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from datetime import datetime
from prisma import Prisma
import jwt
<<<<<<< HEAD
=======
import logging
import asyncio
>>>>>>> 1958c4758858be2adb6e12094648eb92855ea349

# Initialize Flask app
app = Flask(__name__)
<<<<<<< HEAD
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")
=======
CORS(app, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)
>>>>>>> 1958c4758858be2adb6e12094648eb92855ea349

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Prisma client
db = Prisma()

async def connect_prisma():
<<<<<<< HEAD
    await db.connect()
    print("✅ Prisma successfully connected to NeonDB!")

import asyncio
asyncio.run(connect_prisma())
=======
    try:
        await db.connect()
        logger.info("✅ Prisma successfully connected to NeonDB!")
    except Exception as e:
        logger.error(f"Error connecting to Prisma: {e}")

async def disconnect_prisma():
    try:
        await db.disconnect()
        logger.info("✅ Prisma successfully disconnected from NeonDB!")
    except Exception as e:
        logger.error(f"Error disconnecting Prisma: {e}")
>>>>>>> 1958c4758858be2adb6e12094648eb92855ea349

@app.route('/get_logs', methods=['GET'])
async def get_logs():
    try:
<<<<<<< HEAD
        user = db.user.find_first(where={"username": data.get("username")})
        if not user:
            user = db.user.create({"username": data["username"]})
        
        timestamp = datetime.now()
        db.eventlog.create({
            "data": {
                "userId": user.id,
                "timestamp": timestamp,
                "eventType": data["event"],
                "details": str(data.get("details", None))
            }
        })
        print("Logged Event:", data)
    except Exception as e:
        print("Unexpected Error:", e)

def log_event(user_id, event, details=None):
    try:
        timestamp = datetime.now()
        db.eventlog.create({
            "data": {
                "userId": user_id,
                "timestamp": timestamp,
                "eventType": event,
                "details": str(details)
            }
        })
        print("[LOG]", event, details)
    except Exception as e:
        print("Unexpected Error:", e)
=======
        logs = await db.eventlog.find_many()
        logger.info(f"GET /get_logs - Request from {request.remote_addr}")
        return jsonify(logs)
    except Exception as e:
        logger.error(f"Error fetching logs: {e}")
        return jsonify({'error': str(e)}), 500
>>>>>>> 1958c4758858be2adb6e12094648eb92855ea349

@app.route('/log_mouse_movement', methods=['POST'])
async def log_mouse_movement():
    data = request.json
    try:
<<<<<<< HEAD
        db.mousemovement.create({
            "data": {
                "userId": data["userId"],
                "timestamp": datetime.now(),
                "xPos": data["x"],
                "yPos": data["y"]
=======
        logger.info(f"Mouse Movement Event from {request.remote_addr}: {data}")
        await db.mousemovement.create({
            "data": {
                "userId": data["user_id"],
                "x": data["x"],
                "y": ["y"],
                "timestamp": datetime.utcnow()
>>>>>>> 1958c4758858be2adb6e12094648eb92855ea349
            }
        })
        return jsonify({"message": "Mouse movement logged"}), 200
    except Exception as e:
        logger.error(f"Error logging mouse movement: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/log_tab_switch', methods=['POST'])
async def log_tab_switch():
    data = await request.get_json()
    try:
<<<<<<< HEAD
        db.tabswitch.create({
            "data": {
                "userId": data["userId"],
                "timestamp": datetime.now(),
                "tabUrl": data["url"]
=======
        logger.info(f"Tab Switch Event from {request.remote_addr}: {data}")
        await db.tabswitch.create({
            "data": {
                "user_id": data["userId"],
                "timestamp": datetime.utcnow(),
                "event": data["tabName"]
>>>>>>> 1958c4758858be2adb6e12094648eb92855ea349
            }
        })
        return jsonify({"message": "Tab switch logged"}), 200
    except Exception as e:
        logger.error(f"Tab Switch Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/log_key_press', methods=['POST'])
def log_key_press():
    data = request.json
    try:
<<<<<<< HEAD
        db.keystroke.create({
            "data": {
                "userId": data["userId"],
                "timestamp": datetime.now(),
                "keyPressed": data["key"]
            }
        })
        return jsonify({"message": "Keystroke logged"}), 200
=======
        logger.info(f"Keystroke Event from {request.remote_addr}: {data}")
        db.keypress.create({
            "data": {
                "user_id": data["userId"],
                "key": data["key"],
                "timestamp": datetime.utcnow()
            }
        }
        )
        return jsonify({"message": "Key press logged"}), 200
>>>>>>> 1958c4758858be2adb6e12094648eb92855ea349
    except Exception as e:
        logger.error(f"Error logging key press: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    try:
<<<<<<< HEAD
        # Check if email already exists
        existing_user = db.user.find_unique(where={"email": data['email']})
        if existing_user:
            return jsonify({'error': 'Email already in use'}), 400

        user = db.user.create({
            "data": {
                "username": data['username'],
                "email": data['email'],
                "password": data['password'],
                "studentId": data.get('studentId'),
                "course": data.get('course')
            }
        })
        
        token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

=======
        logger.info(f"Signup attempt from {request.remote_addr}: {data}")
        user = db.user.create({
            "data": {
                "email": data["email"],
                "password": data["password"],
                "username": data.get("username"),
            }
        })
        token = jwt.encode({"user_id": user.id}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token, 'user': user.dict()}), 201
    except Exception as e:
        logger.error(f"Signup Error: {e}")
        return jsonify({'error': str(e)}), 500
>>>>>>> 1958c4758858be2adb6e12094648eb92855ea349

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    try:
<<<<<<< HEAD
        user = db.user.find_first(where={"email": data['email'], "password": data['password']})
        if user:
            token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')
            return jsonify({'token': token}), 200
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    socketio.run(app, debug=True)

async def disconnect_prisma():
    await db.disconnect()
    print("Prisma disconnected")

asyncio.run(disconnect_prisma())
print("Flask backend setup complete!")
=======
        user = db.user.find_first(where={"email": data["email"], "password": data["password"]})
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        token = jwt.encode({"user_id": user.id}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token, 'user': user.dict()}), 200
    except Exception as e:
        logger.error(f"Login Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK"}), 200

if __name__ == '__main__':
    try:
        asyncio.run(connect_prisma())
        socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
    except Exception as e:
        logger.error(f"Server Error: {e}")
    finally:
        asyncio.run(disconnect_prisma())
        logger.info("Server shutting down...")
>>>>>>> 1958c4758858be2adb6e12094648eb92855ea349
