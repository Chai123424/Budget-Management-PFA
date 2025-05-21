from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-for-development')

# In-memory user storage (for testing without SQLAlchemy)
users = []

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    # Check if email already exists
    if any(user['email'] == data['email'] for user in users):
        return jsonify({'message': 'Email already registered!'}), 409

    # Hash the password
    hashed_password = generate_password_hash(data['password'], method='sha256')
    
    # Create new user
    new_user = {
        'public_id': str(uuid.uuid4()),
        'name': data['name'],
        'email': data['email'],
        'password': hashed_password,
        'created_at': datetime.datetime.utcnow()
    }
    
    users.append(new_user)
    
    return jsonify({'message': 'User registered successfully!'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Could not verify!'}), 401
    
    user = next((user for user in users if user['email'] == data['email']), None)
    
    if not user:
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    if check_password_hash(user['password'], data['password']):
        # Generate JWT token
        token = jwt.encode({
            'public_id': user['public_id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'id': user['public_id'],
                'name': user['name'],
                'email': user['email']
            }
        }), 200
    
    return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'message': 'Email is required!'}), 400
    
    # Always return success to prevent email enumeration attacks
    return jsonify({'message': 'If an account with that email exists, a password reset link has been sent.'}), 200

@app.route('/api/user', methods=['GET'])
def get_user_info():
    # This would normally be protected with a token check
    # For testing, just return a success message
    return jsonify({'message': 'User info endpoint works!'}), 200

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'message': 'API is working!'}), 200

if __name__ == '__main__':
    app.run(debug=True)