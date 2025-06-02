from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
import bcrypt
import certifi
from db_connection import get_database_connection
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8082", "http://10.0.2.2:*"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'supersecretkey')

print("Starting MongoDB connection setup...")

# Établir la connexion à la base de données
client, db, users_collection , budgets_collection = get_database_connection()

# Vérifier l'état de la connexion MongoDB
if users_collection is None:
    print("WARNING: MongoDB connection could not be established. Some features will be disabled.")
else:
    print("MongoDB connection established successfully. Collection 'users' is available.")
    
if budgets_collection is None:
    print("WARNING: Budgets collection could not be established. Some features will be disabled.")
else:
    print("Budgets collection is available.")
    
@app.route('/api/register', methods=["GET", "POST"])
def register():
    # Check if MongoDB connection is available
    if users_collection is None:
        return jsonify({"message": "Database connection error, please try again later"}), 503
        
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
    # Check if MongoDB connection is available
    if users_collection is None:
        return jsonify({"message": "Database connection error, please try again later"}), 503
        
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

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
        except Exception as e:
            print(f"Token error: {e}")
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated

# Créer une collection pour les budgets
if db is not None:
    budgets_collection = db['budgets']
else:
    budgets_collection = None

# Route pour sauvegarder les données du formulaire
@app.route('/api/users/save_budget_data', methods=['POST'])
@token_required
def save_budget_data(current_user):
    if budgets_collection is None:
        return jsonify({'message': 'Database connection error'}), 503
        
    data = request.get_json()
    
    required_fields = ['budget', 'hasTuition', 'rent', 'food', 'transport']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    budget_data = {
        'userId': str(current_user['_id']),
        'monthlyBudget': float(data['budget']),
        'hasTuition': data['hasTuition'],
        'expenses': {
            'rent': float(data['rent']),
            'food': float(data['food']),
            'transport': float(data['transport'])
        },
        'tuitionAmount': float(data.get('tuitionAmount', 0)),
        'updatedAt': datetime.utcnow()
    }
    
    # Upsert (insert or update)
    result = budgets_collection.update_one(
        {'userId': str(current_user['_id'])},
        {'$set': budget_data},
        upsert=True
    )
    
    return jsonify({
        'message': 'Budget data saved successfully',
        'data': budget_data
    }), 200

# Route pour récupérer les données du formulaire
@app.route('/api/users/get_budget_data', methods=['GET'])
@token_required
def get_budget_data(current_user):
    if budgets_collection is None:
        return jsonify({'message': 'Database connection error'}), 503
        
    budget_data = budgets_collection.find_one(
        {'userId': str(current_user['_id'])})
    
    if not budget_data:
        return jsonify({'message': 'No budget data found'}), 404
    
    # Convertir ObjectId en string
    budget_data['_id'] = str(budget_data['_id'])
    
    return jsonify(budget_data), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)