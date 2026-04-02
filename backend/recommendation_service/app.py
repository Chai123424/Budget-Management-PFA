from flask import Flask, send_from_directory, abort, jsonify
import os

app = Flask(__name__)

# Chemin absolu vers le dossier contenant les images
PICTURE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pictures')

print(f"Dossier des images : {PICTURE_FOLDER}")
print(f"Le dossier existe : {os.path.exists(PICTURE_FOLDER)}")

@app.route('/')
def index():
    return 'Service de recommendations en ligne'

@app.route('/pictures/<filename>')
def serve_picture(filename):
    try:
        # Vérifier si le dossier existe
        if not os.path.exists(PICTURE_FOLDER):
            return jsonify({'error': f'Le dossier pictures n\'existe pas : {PICTURE_FOLDER}'}), 404
        
        # Vérifier si le fichier existe
        file_path = os.path.join(PICTURE_FOLDER, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': f'Le fichier {filename} n\'existe pas'}), 404
        
        return send_from_directory(PICTURE_FOLDER, filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/debug')
def debug():
    """Route de debug pour vérifier la configuration"""
    files_in_pictures = []
    if os.path.exists(PICTURE_FOLDER):
        files_in_pictures = os.listdir(PICTURE_FOLDER)
    
    return jsonify({
        'picture_folder': PICTURE_FOLDER,
        'folder_exists': os.path.exists(PICTURE_FOLDER),
        'files_in_folder': files_in_pictures,
        'current_directory': os.getcwd()
    })

if __name__ == '__main__':
    # Créer le dossier pictures s'il n'existe pas
    if not os.path.exists(PICTURE_FOLDER):
        os.makedirs(PICTURE_FOLDER)
        print(f"Dossier créé : {PICTURE_FOLDER}")
    
    app.run(debug=True, port=5000, host='0.0.0.0')