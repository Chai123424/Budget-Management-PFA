from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# Chemin absolu vers le dossier contenant les images
PICTURE_FOLDER = os.path.join(os.path.dirname(__file__), 'pictures')

@app.route('/')
def index():
    return 'Service de recommendations en ligne'

@app.route('/pictures/<filename>')
def serve_picture(filename):
    return send_from_directory(PICTURE_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
