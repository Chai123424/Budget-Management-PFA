from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

from flask_mysqldb import MySQL  # Notez la casse

app = Flask(__name__)
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'budget_app'

mysql = MySQL(app)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:19006", "http://10.0.2.2:*"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/api/register', methods=['POST'])
def register():
    cur = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400

        cur = mysql.connection.cursor()
        
        # Vérification email existant
        cur.execute("SELECT email FROM users WHERE email = %s", (data['email'],))
        if cur.fetchone():
            return jsonify({"error": "Email already exists"}), 409

        # Insertion
        cur.execute(
            "INSERT INTO users (public_id, name, email, password) VALUES (%s, %s, %s, %s)",
            (str(uuid.uuid4()), data['name'], data['email'], generate_password_hash(data['password']))
        )
        mysql.connection.commit()
        return jsonify({"success": True}), 201

    except Exception as e:
        if mysql.connection:
            mysql.connection.rollback()
        app.logger.error("Error in register: %s", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if cur:
            cur.close()
            
                
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data['email'] or not data['password']:
        return jsonify({'message': 'Veuillez fournir un email et un mot de passe !'}), 400
    
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (data['email'],))
    user = cur.fetchone()
    cur.close()
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Identifiants invalides !'}), 401
    
    token = jwt.encode({
        'public_id': user['public_id'],
        'exp': datetime.utcnow() + timedelta(days=30)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['public_id'],
            'name': user['name'],
            'email': user['email']
        }
    }), 200
    
    
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