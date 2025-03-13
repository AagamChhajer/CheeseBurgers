from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from datetime import datetime
from prisma import Prisma
import jwt
import logging
import asyncio

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Prisma client
db = Prisma()

async def connect_prisma():
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

@app.route('/get_logs', methods=['GET'])
async def get_logs():
    try:
        logs = await db.eventlog.find_many()
        logger.info(f"GET /get_logs - Request from {request.remote_addr}")
        return jsonify(logs)
    except Exception as e:
        logger.error(f"Error fetching logs: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/log_mouse_movement', methods=['POST'])
async def log_mouse_movement():
    data = request.json
    try:
        logger.info(f"Mouse Movement Event from {request.remote_addr}: {data}")
        await db.mousemovement.create({
            "data": {
                "userId": data["user_id"],
                "x": data["x"],
                "y": ["y"],
                "timestamp": datetime.utcnow()
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
        logger.info(f"Tab Switch Event from {request.remote_addr}: {data}")
        await db.tabswitch.create({
            "data": {
                "user_id": data["userId"],
                "timestamp": datetime.utcnow(),
                "event": data["tabName"]
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
    except Exception as e:
        logger.error(f"Error logging key press: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    try:
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

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    try:
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
