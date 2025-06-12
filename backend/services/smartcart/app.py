from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection
MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client.get_database('budget_management')

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

@app.route('/api/products/student', methods=['GET'])
def get_student_products():
    try:
        # Get products with price filter for students
        products_collection = db.products
        student_products = list(products_collection.find({"price": {"$lte": 1000}}))
        
        # Convert ObjectId to string for JSON serialization
        for product in student_products:
            product['_id'] = str(product['_id'])
        
        return jsonify(student_products)
    except Exception as e:
        print(f"Error in get_student_products: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/category/<category>', methods=['GET'])
def get_products_by_category(category):
    try:
        products_collection = db.products
        category_products = list(products_collection.find({"category": category}))
        
        # Convert ObjectId to string for JSON serialization
        for product in category_products:
            product['_id'] = str(product['_id'])
        
        return jsonify(category_products)
    except Exception as e:
        print(f"Error in get_products_by_category: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/search', methods=['GET'])
def search_products():
    query = request.args.get('q', '')
    try:
        products_collection = db.products
        # Search in name and category using case-insensitive regex
        search_results = list(products_collection.find({
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}}
            ]
        }))
        
        # Convert ObjectId to string for JSON serialization
        for product in search_results:
            product['_id'] = str(product['_id'])
        
        return jsonify(search_results)
    except Exception as e:
        print(f"Error in search_products: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(debug=True, host='0.0.0.0', port=port) 