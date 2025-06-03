from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
import traceback

# Charger les variables d'environnement
load_dotenv()

# Récupérer la clé API Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("La clé API Gemini n'est pas définie dans le fichier .env")

# Configuration de l'application Flask
app = Flask(__name__)
CORS(app)

# Configuration de Gemini avec des paramètres de sécurité
genai.configure(api_key=GEMINI_API_KEY)

# Création du modèle Gemini avec un contexte financier
SYSTEM_PROMPT = """Tu es un assistant financier expert. Tu dois:
1. Donner des conseils financiers pratiques et personnalisés
2. Aider à la gestion de budget et à l'épargne
3. Expliquer les concepts financiers simplement
4. Rester professionnel et bienveillant
5. Répondre en français
6. Être concis et direct dans tes réponses

N'oublie pas:
- Ne donne pas de conseils d'investissement spécifiques
- Ne demande pas d'informations personnelles sensibles
- Indique clairement quand une information est générale
"""

# Variable globale pour le chat
chat = None

def initialize_chat():
    global chat
    try:
        # Utiliser le modèle correct de Gemini
        model = genai.GenerativeModel('gemini-1.0-pro-001')
        chat = model.start_chat(history=[])
        
        # Envoyer le prompt système
        response = chat.send_message(SYSTEM_PROMPT)
        
        if not response.text:
            raise Exception("Pas de réponse initiale de Gemini")
            
        print("✅ Chat Gemini initialisé avec succès")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation du chat: {str(e)}")
        print(traceback.format_exc())
        return False

@app.route('/')
def home():
    global chat
    status = "success" if chat else "error"
    message = "Backend Flask opérationnel" if chat else "Backend en erreur - Gemini non initialisé"
    
    return jsonify({
        "status": status,
        "message": message,
        "version": "1.0.0"
    })

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    global chat
    
    # Vérifier si le chat est initialisé
    if not chat:
        if not initialize_chat():
            return jsonify({
                "error": "Le service n'est pas disponible actuellement. Veuillez réessayer plus tard."
            }), 503

    try:
        # Validation des données reçues
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                "error": "Format de requête invalide. 'message' est requis."
            }), 400

        user_message = data['message'].get('text', '')
        if not user_message:
            return jsonify({
                "error": "Le message ne peut pas être vide."
            }), 400

        # Envoi du message à Gemini
        response = chat.send_message(user_message)
        
        if not response or not response.text:
            raise Exception("Pas de réponse de l'IA")

        # Retourner la réponse
        return jsonify({
            "reply": response.text
        })

    except Exception as e:
        # Log l'erreur complète pour le débogage
        print(f"Erreur lors du traitement: {str(e)}")
        print(traceback.format_exc())
        
        # Réinitialiser le chat en cas d'erreur
        if "not found" in str(e).lower() or "503" in str(e):
            chat = None
            if not initialize_chat():
                return jsonify({
                    "error": "Erreur de connexion avec l'IA. Veuillez réessayer dans quelques instants."
                }), 503
        
        # Retourner une erreur appropriée au client
        error_message = "Une erreur est survenue lors du traitement de votre demande."
        if "rate_limit" in str(e).lower():
            error_message = "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants."
        elif "invalid_request" in str(e).lower():
            error_message = "Requête invalide. Veuillez vérifier votre message."
        elif "not found" in str(e).lower():
            error_message = "Modèle IA temporairement indisponible. Veuillez réessayer."
        
        return jsonify({
            "error": error_message
        }), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Route non trouvée"
    }), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({
        "error": "Erreur interne du serveur"
    }), 500

if __name__ == '__main__':
    # Vérifier la configuration avant le démarrage
    if not GEMINI_API_KEY:
        print("⚠️ ATTENTION: La clé API Gemini n'est pas configurée!")
        exit(1)
    
    print("🚀 Démarrage du serveur Flask...")
    
    # Initialiser le chat
    if initialize_chat():
        print("✨ Tout est prêt!")
    else:
        print("⚠️ Démarrage avec des erreurs - Le chat sera initialisé à la première requête")
    
    # Démarrer le serveur
    app.run(debug=True, host='0.0.0.0', port=5000)
