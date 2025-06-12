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
from typing import Dict, List, Any
from pymongo import MongoClient

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

# Créer une collection pour les budgets et les dépenses
if db is not None:
    budgets_collection = db['budgets']
    expenses_collection = db['expenses']
else:
    budgets_collection = None
    expenses_collection = None

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
        'updatedAt': datetime.datetime.utcnow()
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

# Route pour sauvegarder les dépenses
@app.route('/api/users/save_expenses', methods=['POST'])
@token_required
def save_expenses(current_user):
    if expenses_collection is None:
        return jsonify({'message': 'Database connection error'}), 503
        
    data = request.get_json()
    
    if not data or 'expenses' not in data:
        return jsonify({'message': 'Missing expenses data'}), 400
    
    expenses_data = {
        'userId': str(current_user['_id']),
        'expenses': data['expenses'],
        'updatedAt': datetime.datetime.utcnow()
    }
    
    # Upsert (insert or update)
    result = expenses_collection.update_one(
        {'userId': str(current_user['_id'])},
        {'$set': expenses_data},
        upsert=True
    )
    
    return jsonify({
        'message': 'Expenses saved successfully',
        'data': expenses_data
    }), 200

# Route pour récupérer les dépenses
@app.route('/api/users/get_expenses', methods=['GET'])
@token_required
def get_expenses(current_user):
    if expenses_collection is None:
        return jsonify({'message': 'Database connection error'}), 503
    
    # Récupérer les dépenses de l'utilisateur
    expenses = expenses_collection.find_one({'userId': str(current_user['_id'])})
    
    if expenses:
        # Supprimer l'ID MongoDB pour la sérialisation JSON
        expenses.pop('_id', None)
        return jsonify(expenses), 200
    else:
        return jsonify({'message': 'No expenses found', 'expenses': []}), 200

def check_db():
    if users_collection is None:
        return jsonify({'error': 'Database connection not available'}), 500
    return None

@app.route('/api/users/get_goals', methods=['GET'])
@token_required
def get_goals(current_user: Dict[str, Any]):
    try:
        db_error = check_db()
        if db_error:
            return db_error
            
        user_id = current_user['_id']
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        goals = user.get('goals', [])
        return jsonify({'goals': goals})
    except Exception as e:
        print(f'Error getting goals: {str(e)}')
        return jsonify({'error': 'Failed to get goals'}), 500

@app.route('/api/users/save_goals', methods=['POST'])
@token_required
def save_goals(current_user: Dict[str, Any]):
    try:
        db_error = check_db()
        if db_error:
            return db_error
            
        user_id = current_user['_id']
        goals: List[Dict[str, Any]] = request.json.get('goals', [])
        
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'goals': goals}}
        )
        
        if result.modified_count > 0:
            return jsonify({'message': 'Goals saved successfully'})
        else:
            return jsonify({'error': 'No changes made'}), 400
    except Exception as e:
        print(f'Error saving goals: {str(e)}')
        return jsonify({'error': 'Failed to save goals'}), 500

# Products routes
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        # Get products collection from MongoDB Atlas
        products_collection = db.products
        products = list(products_collection.find())
        
        # Convert ObjectId to string for JSON serialization
        for product in products:
            product['_id'] = str(product['_id'])
            
        if not products:
            # If no products exist, create some sample products
            sample_products = [
                {
                    "name": "Ordinateur portable",
                    "price": 8000.00,
                    "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
                    "category": "Électronique"
                },
                {
                    "name": "Smartphone",
                    "price": 3000.00,
                    "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
                    "category": "Électronique"
                },
                {
                    "name": "Livres universitaires",
                    "price": 500.00,
                    "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
                    "category": "Éducation"
                },
                {
                    "name": "Abonnement transport",
                    "price": 250.00,
                    "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
                    "category": "Transport"
                }
            ]
            
            # Insert sample products
            products_collection.insert_many(sample_products)
            
            # Fetch the newly inserted products
            products = list(products_collection.find())
            for product in products:
                product['_id'] = str(product['_id'])
        
        return jsonify(products)
    except Exception as e:
        print(f"Error in get_products: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)