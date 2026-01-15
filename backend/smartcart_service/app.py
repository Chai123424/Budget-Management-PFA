from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import json
import logging
import os
from datetime import datetime
from config import Config

ALLOWED_FOOD_GROUPS = ["dairy", "vegetables", "protein", "carbs", "condiments", "fruits"]
ALLOWED_PRICE_CATEGORIES = ["very_cheap", "cheap"]
STUDENT_MAX_PRICE = 25


app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS.split(','))
# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection with improved error handling
try:
    username = os.getenv('MONGODB_USERNAME')
    password = os.getenv('MONGODB_PASSWORD')
    cluster = os.getenv('MONGODB_CLUSTER')
    database_name = os.getenv('MONGODB_DATABASE', 'smart_cart')
    
    mongo_uri = f"mongodb+srv://{username}:{password}@{cluster}/{database_name}?retryWrites=true&w=majority"
    client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=30000,  # Increased timeout
        connectTimeoutMS=20000,
        socketTimeoutMS=20000,
        maxPoolSize=50,
        retryWrites=True,
        retryReads=True,
        w='majority',  # Write concern
        readPreference='primaryPreferred'  # Read preference
    )
    
    # Verify connection
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB!")
    
    # Get database and collections
    db = client[database_name]
    
    # Initialize collections if they don't exist
    collections_to_check = ['products']
    for collection_name in collections_to_check:
        if collection_name not in db.list_collection_names():
            logger.warning(f"{collection_name} collection doesn't exist - creating empty collection")
            db.create_collection(collection_name)
    
    # Reference to collections
    products_collection = db['products']
    
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    products_collection = None
    client = None

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

app.json_encoder = JSONEncoder


def classify_price_category(price):
    """Classify price into categories for student budget"""
    if price <= 8:
        return "very_cheap"
    elif price <= 15:
        return "cheap"
    elif price <= 25:
        return "moderate"
    else:
        return "expensive"


def enhanced_format_product_for_frontend(product):
    """Enhanced product formatting with price categories and filtering"""
    price = float(product.get('price', 0))
    food_group = product.get('food_group', '').lower()
    category = product.get('category', '').lower()
    
    # Use food_group if available, otherwise try to map category
    final_food_group = food_group if food_group else category
    
    # Classify price category
    price_category = classify_price_category(price)
    
    formatted_product = {
        '_id': str(product['_id']),
        'product_name': product.get('name', ''),
        'price': price,
        'category': product.get('category', '').title(),
        'brand_name': extract_brand_from_name(product.get('name', '')),
        'food_group': final_food_group,
        'image_url': product.get('image_url', ''),
        'description': product.get('description', ''),
        'extracted_quantity': product.get('extracted_quantity', 0),
        'extracted_unit': product.get('extracted_unit', ''),
        'price_per_unit': product.get('price_per_unit', 0),
        'price_category': price_category,
        'is_organic': product.get('is_organic', False),
        'is_premium': product.get('is_premium', False),
        'is_local': product.get('is_local', False),
        'student_friendly': price <= STUDENT_MAX_PRICE and price_category in ALLOWED_PRICE_CATEGORIES
    }
    
    return formatted_product


def filter_student_products(products):
    """Filter products for student budget and requirements"""
    filtered = []
    for product in products:
        formatted = enhanced_format_product_for_frontend(product)
        
        # Apply student-friendly filters
        if (formatted['student_friendly'] and 
            formatted['food_group'] in ALLOWED_FOOD_GROUPS and
            formatted['price'] > 0):
            filtered.append(formatted)
    
    return filtered


def extract_brand_from_name(product_name):
    """Extract brand name from product name"""
    common_brands = ['jaouda', 'jibal', 'marrakech', 'sidi ali', 'vita kids', 'danone']
    name_lower = product_name.lower()
    
    for brand in common_brands:
        if brand in name_lower:
            return brand.title()
    
    # If no known brand found, use first word as brand
    words = product_name.split()
    return words[0].title() if words else "Marque inconnue"

def format_product_for_frontend(product):
    """Convert database product to frontend format"""
    # Extract brand from name if not present
    brand_name = extract_brand_from_name(product.get('name', ''))
    
    return {
        '_id': str(product['_id']),
        'product_name': product.get('name', ''),
        'price': float(product.get('price', 0)),
        'category': product.get('category', '').title(),
        'brand_name': brand_name,
        'food_group': product.get('food_group', ''),
        'image_url': product.get('image_url', ''),
        'description': product.get('description', ''),
        'extracted_quantity': product.get('extracted_quantity', 0),
        'extracted_unit': product.get('extracted_unit', ''),
        'price_per_unit': product.get('price_per_unit', 0),
        'price_category': product.get('price_category', ''),
        'is_organic': product.get('is_organic', False),
        'is_premium': product.get('is_premium', False),
        'is_local': product.get('is_local', False)
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        if client is not None:
            client.admin.command('ping')
            db_status = True
            # Get actual count
            product_count = products_collection.count_documents({}) if products_collection else 0
        else:
            db_status = False
            product_count = 0
            
        return jsonify({
            'status': 'healthy',
            'service': 'smartcart_service',
            'mongodb_connected': db_status,
            'product_count': product_count,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'smartcart_service',
            'mongodb_connected': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        if products_collection is None:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Paramètres de requête
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        category = request.args.get('category')
        search = request.args.get('search', '')
        student_filter = request.args.get('student_filter', 'true').lower() == 'true'
        
        # Construction de la requête
        query = {}
        
        # Build search query
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'category': {'$regex': search, '$options': 'i'}},
                {'food_group': {'$regex': search, '$options': 'i'}}
            ]
        
        if category and category != 'all':
            query['category'] = {'$regex': category, '$options': 'i'}
        
        # Add price filter for student budget
        if student_filter:
            query['price'] = {'$lte': STUDENT_MAX_PRICE, '$gt': 0}
        
        logger.info(f"Searching products with query: {query}")
        
        # Récupération avec pagination
        products = list(products_collection.find(query)
            .skip((page - 1) * per_page)
            .limit(per_page)
            .sort('name', 1))
        
        total = products_collection.count_documents(query)
        
        # Format products based on student filter
        if student_filter:
            formatted_products = filter_student_products(products)
        else:
            formatted_products = [enhanced_format_product_for_frontend(product) for product in products]
        
        return jsonify({
            'products': formatted_products,
            'total': total,
            'page': page,
            'per_page': per_page,
            'query_used': query,
            'student_filtered': student_filter,
            'allowed_food_groups': ALLOWED_FOOD_GROUPS if student_filter else None,
            'allowed_price_categories': ALLOWED_PRICE_CATEGORIES if student_filter else None
        })
    except Exception as e:
        logger.error(f"Error fetching products: {e}", exc_info=True)
        return jsonify({'error': f'Failed to fetch products: {str(e)}'}), 500


@app.route('/api/student/config', methods=['GET'])
def get_student_config():
    """Get student-specific configuration"""
    return jsonify({
        'allowed_food_groups': ALLOWED_FOOD_GROUPS,
        'allowed_price_categories': ALLOWED_PRICE_CATEGORIES,
        'max_price': STUDENT_MAX_PRICE,
        'currency_symbol': 'DH'
    })



@app.route('/api/student/popular', methods=['GET'])
def get_student_popular_products():
    """Get popular products filtered for student budget"""
    try:
        if products_collection is None:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Get products within student budget
        pipeline = [
            {'$match': {'price': {'$lte': STUDENT_MAX_PRICE, '$gt': 0}}},
            {'$sample': {'size': 20}}
        ]
        
        popular_products = list(products_collection.aggregate(pipeline))
        
        # Apply student filtering
        filtered_products = filter_student_products(popular_products)
        
        return jsonify({
            'popular_products': filtered_products[:15],
            'total': len(filtered_products)
        })
        
    except Exception as e:
        logger.error(f"Error fetching student popular products: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch popular products'}), 500
    
    
@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        if products_collection is None:
            return jsonify({'error': 'Database connection not available'}), 500
        
        if not ObjectId.is_valid(product_id):
            return jsonify({'error': 'Invalid product ID format'}), 400
            
        product = products_collection.find_one({'_id': ObjectId(product_id)})
        
        if product is None:
            return jsonify({'error': 'Product not found'}), 404
        
        formatted_product = format_product_for_frontend(product)
        return jsonify(formatted_product)
        
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch product'}), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all unique categories"""
    try:
        if products_collection is None:
            return jsonify({'error': 'Database connection not available'}), 500
        
        categories = products_collection.distinct('category')
        # Filter and clean categories
        categories = [cat.strip().title() for cat in categories if cat and str(cat).strip()]
        categories = list(set(categories))  # Remove duplicates
        categories.sort()
        
        logger.info(f"Found categories: {categories}")
        
        return jsonify({'categories': categories})
        
    except Exception as e:
        logger.error(f"Error fetching categories: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch categories'}), 500

@app.route('/api/recommendations/<product_id>', methods=['GET'])
def get_recommendations(product_id):
    """Get product recommendations based on category and food group"""
    try:
        if products_collection is None:
            return jsonify({'error': 'Database connection not available'}), 500
        
        if not ObjectId.is_valid(product_id):
            return jsonify({'error': 'Invalid product ID format'}), 400
            
        current_product = products_collection.find_one({'_id': ObjectId(product_id)})
        
        if current_product is None:
            return jsonify({'error': 'Product not found'}), 404
        
        # Build recommendation query
        query = {
            '_id': {'$ne': ObjectId(product_id)}
        }
        
        # Add category or food_group if they exist
        or_conditions = []
        if 'category' in current_product:
            or_conditions.append({'category': current_product['category']})
        if 'food_group' in current_product:
            or_conditions.append({'food_group': current_product['food_group']})
            
        if or_conditions:
            query['$or'] = or_conditions
        
        recommendations = list(products_collection.find(query).limit(10))
        
        # Format recommendations
        formatted_recommendations = [format_product_for_frontend(product) for product in recommendations]
        
        return jsonify({'recommendations': formatted_recommendations})
        
    except Exception as e:
        logger.error(f"Error fetching recommendations for {product_id}: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch recommendations'}), 500

@app.route('/api/popular', methods=['GET'])
def get_popular_products():
    """Get popular products (random selection for demo)"""
    try:
        if products_collection is None:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Get random sample of products
        pipeline = [
            {'$sample': {'size': 15}}
        ]
        
        popular_products = list(products_collection.aggregate(pipeline))
        
        # Format products
        formatted_products = [format_product_for_frontend(product) for product in popular_products]
        
        return jsonify({'popular_products': formatted_products})
        
    except Exception as e:
        logger.error(f"Error fetching popular products: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch popular products'}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get database statistics"""
    try:
        if products_collection is None:
            return jsonify({'error': 'Database connection not available'}), 500
        
        total_products = products_collection.count_documents({})
        total_categories = len(products_collection.distinct('category'))
        total_food_groups = len(products_collection.distinct('food_group'))
        
        # Price statistics
        price_stats = list(products_collection.aggregate([
            {
                '$group': {
                    '_id': None,
                    'avg_price': {'$avg': '$price'},
                    'min_price': {'$min': '$price'},
                    'max_price': {'$max': '$price'}
                }
            }
        ]))
        
        stats = {
            'total_products': total_products,
            'total_categories': total_categories,
            'total_food_groups': total_food_groups
        }
        
        if price_stats:
            stats.update({
                'average_price': round(price_stats[0]['avg_price'], 2),
                'min_price': price_stats[0]['min_price'],
                'max_price': price_stats[0]['max_price']
            })
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error fetching stats: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch statistics'}), 500

@app.route('/api/test-connection', methods=['GET'])
def test_connection():
    """Test database connection and show sample data"""
    try:
        if products_collection is None:
            return jsonify({'error': 'Database connection not available'}), 500
        
        # Get total count
        total_count = products_collection.count_documents({})
        
        # Get a few sample products
        sample_products = list(products_collection.find({}).limit(3))
        
        # Format sample products
        formatted_samples = [format_product_for_frontend(product) for product in sample_products]
        
        return jsonify({
            'connection_status': 'Connected',
            'total_products': total_count,
            'sample_products': formatted_samples,
            'database_name': database_name
        })
        
    except Exception as e:
        logger.error(f"Error testing connection: {e}", exc_info=True)
        return jsonify({'error': f'Connection test failed: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}", exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    print(f"🛒 Smart Cart Service starting on port {port}")
    print(f"📋 Available endpoints:")
    print(f"   • Products: http://localhost:{port}/api/products")
    print(f"   • Health: http://localhost:{port}/api/health")
    print(f"   • Categories: http://localhost:{port}/api/categories")
    app.run(host='0.0.0.0', port=port, debug=debug)

