from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
print(genai.__version__)
# Charger la clé API de Gemini depuis .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("CLÉ GEMINI:", GEMINI_API_KEY)
# Configurer Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Flask backend working with Gemini!"

@app.route('/api/chat', methods=['POST'])  # corriger ici aussi le path
def chat():
    data = request.get_json()
    message = data.get("message", {}).get("text")  # extraire message.text de l'objet user

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        response = model.generate_content(message)
        return jsonify({"reply": response.text})
    except Exception as e:
        print("Erreur Gemini:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
