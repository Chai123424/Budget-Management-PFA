from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React

@app.route('/api')
def home():
    return {'status': 'Flask backend running!'}

if __name__ == '__main__':
    app.run(debug=True)
