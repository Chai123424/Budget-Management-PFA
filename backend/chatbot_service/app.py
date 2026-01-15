from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
from datetime import datetime
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Charger les variables d'environnement
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY not found in environment variables")
    raise ValueError("GEMINI_API_KEY is required")

try:
    # Configurer Gemini
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    logger.info("Gemini AI configured successfully")
except Exception as e:
    logger.error(f"Error configuring Gemini AI: {str(e)}")
    raise

app = Flask(__name__)
# Configurer CORS pour permettre toutes les origines
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"]
    }
})

@app.before_request
def log_request_info():
    """Log details about each request"""
    logger.info(f"Request Method: {request.method}")
    logger.info(f"Request URL: {request.url}")
    logger.info(f"Request Headers: {dict(request.headers)}")
    if request.is_json:
        logger.info(f"Request Body: {request.get_json()}")

@app.after_request
def after_request(response):
    """Log response details and add CORS headers"""
    logger.info(f"Response Status: {response.status}")
    logger.info(f"Response Headers: {dict(response.headers)}")
    
    # Ensure CORS headers are set
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/')
def home():
    """Root endpoint"""
    return jsonify({
        'service': 'Budget Management Chatbot Service with Gemini AI',
        'status': 'running',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        # Vérifier si Gemini est configuré
        if not GEMINI_API_KEY:
            return jsonify({
                'status': 'error',
                'message': 'Gemini API key not configured'
            }), 500
            
        return jsonify({
            'status': 'healthy',
            'gemini': 'configured',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Main chat endpoint using Gemini AI for budget management assistance"""
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        logger.info("Received chat request")
        
        # Vérifier le Content-Type
        if not request.is_json:
            logger.error("Request Content-Type is not application/json")
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        logger.info(f"Received data: {data}")
        
        # Extraire le message
        if isinstance(data.get("message"), dict):
            message = data["message"].get("text")
        else:
            message = data.get("message")
        
        if not message or not message.strip():
            logger.error("No message provided in request")
            return jsonify({'error': 'No message provided'}), 400

        # Créer le prompt pour Gemini
        budget_prompt = f"""
        You are a helpful budget management assistant. The user is asking about: "{message}"
        
        Please provide helpful, practical advice about budget management, expense tracking, savings, 
        financial planning, or money management. Keep your response concise but informative.
        
        If the question is not related to budget/finance, gently redirect the conversation back to 
        budget management topics while still being helpful.
        """
        
        logger.info("Generating response with Gemini")
        response = model.generate_content(budget_prompt)
        
        if not response or not response.text:
            logger.error("Empty response from Gemini")
            return jsonify({
                'error': 'No response generated',
                'status': 'error'
            }), 500
        
        logger.info("Successfully generated response")
        return jsonify({
            'reply': response.text,
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({
            'error': f"Chat service error: {str(e)}",
            'status': 'error'
        }), 500

@app.route('/api/budget/categories', methods=['GET'])
def get_budget_categories():
    """Get available budget categories"""
    categories = [
        {'id': 1, 'name': 'Housing', 'type': 'expense', 'color': '#FF6B6B'},
        {'id': 2, 'name': 'Food', 'type': 'expense', 'color': '#4ECDC4'},
        {'id': 3, 'name': 'Transportation', 'type': 'expense', 'color': '#45B7D1'},
        {'id': 4, 'name': 'Healthcare', 'type': 'expense', 'color': '#96CEB4'},
        {'id': 5, 'name': 'Entertainment', 'type': 'expense', 'color': '#FFEAA7'},
        {'id': 6, 'name': 'Savings', 'type': 'savings', 'color': '#DDA0DD'},
        {'id': 7, 'name': 'Emergency Fund', 'type': 'savings', 'color': '#98D8C8'},
        {'id': 8, 'name': 'Others', 'type': 'expense', 'color': '#F7DC6F'}
    ]
    
    return jsonify({
        'categories': categories,
        'status': 'success'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'status': 'error'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'status': 'error'
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    
    logger.info(f"Starting server on port {port}")
    logger.info("Available endpoints:")
    logger.info(f" * Chat: http://localhost:{port}/api/chat")
    logger.info(f" * Health: http://localhost:{port}/api/health")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )