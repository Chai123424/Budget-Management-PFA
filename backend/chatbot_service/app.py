from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
from datetime import datetime
import logging

# Charger la clé API de Gemini depuis .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("CLÉ GEMINI:", GEMINI_API_KEY)

# Configurer Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'chatbot_service',
        'port': 5000,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint using Gemini AI for budget management assistance"""
    try:
        # Get request data
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        
        # Handle different message formats
        message = data.get("message", {}).get("text") if isinstance(data.get("message"), dict) else data.get("message")
        
        if not message:
            return jsonify({"error": "No message provided"}), 400

        user_id = data.get('user_id', 'anonymous')
        
        if not message.strip():
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        logger.info(f"Received chat message from {user_id}: {message}")
        
        # Create budget-focused prompt for Gemini
        budget_prompt = f"""
        You are a helpful budget management assistant. The user is asking about: "{message}"
        
        Please provide helpful, practical advice about budget management, expense tracking, savings, 
        financial planning, or money management. Keep your response concise but informative.
        
        If the question is not related to budget/finance, gently redirect the conversation back to 
        budget management topics while still being helpful.
        """
        
        # Generate response using Gemini
        response = model.generate_content(budget_prompt)
        
        return jsonify({
            "reply": response.text,
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id
        })
        
    except Exception as e:
        logger.error(f'Error in chat endpoint: {str(e)}')
        print("Erreur Gemini:", str(e))
        return jsonify({
            "error": f"Chat service error: {str(e)}",
            "status": "error"
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
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🤖 Budget Management Chatbot Service starting on port {port}")
    print(f"📋 Available endpoints:")
    print(f"   • Chat: http://localhost:{port}/api/chat")
    print(f"   • Health: http://localhost:{port}/api/health")
    print(f"   • Categories: http://localhost:{port}/api/budget/categories")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        use_reloader=False  # Prevent double startup in debug mode
    )