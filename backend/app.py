from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt


app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8082", "http://10.0.2.2:*"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
app.config['SECRET_KEY'] = 'supersecretkey'

# Configuration MongoDB
app.config['MONGO_URI'] = 'mongodb+srv://khadija:KCS123@cluster0.ae1rtol.mongodb.net/budget_app?retryWrites=true&w=majority'

client = MongoClient(app.config['MONGO_URI'])
db = client["budget_app"]
users_collection = db['users']

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if users_collection.find_one({"email": email}):
        return jsonify({"message": "Email already exists"}), 409

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed
    })

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    if bcrypt.checkpw(password.encode('utf-8'), user['password']):
        token = jwt.encode(
            {'user_id': str(user['_id']), 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )
        return jsonify({"token": token, "user": {"email": email}}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401

    
    
@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'message': 'Email is required!'}), 400
    
    return jsonify({'message': 'If an account with that email exists, a password reset link has been sent.'}), 200

@app.route('/api/user', methods=['GET'])
def get_user_info():
    return jsonify({'message': 'User info endpoint works!'}), 200

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'message': 'API is working!'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)