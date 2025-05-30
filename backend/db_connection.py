import certifi
import ssl
from pymongo import MongoClient
import urllib.parse
from urllib.parse import quote_plus
import requests
import socket
import time
import os
import json
from datetime import datetime
from bson.objectid import ObjectId
from dotenv import load_dotenv

# Charger les variables d'environnement du fichier .env
load_dotenv()

def get_database_connection():
    """
    Établit une connexion à la base de données MongoDB et retourne les objets de connexion.
    Plusieurs méthodes sont essayées en cas d'échec de la méthode standard.
    """
    budgets_collection = None
    users_collection = None
    db = None
    client = None
    
    # Vérification internet
    has_internet = False
    try:
        print("Vérification de la connexion internet...")
        socket.create_connection(("www.google.com", 80))
        print("Connexion internet OK")
        has_internet = True
    except OSError:
        print("ERREUR: Pas de connexion internet")
        has_internet = False
        
    # Méthode 1: Connexion standard avec certificat personnalisé
    try:
        print("Méthode 1: Connexion avec certificat spécifique...")
        # Utiliser directement l'URI fournie ou construire à partir des variables d'environnement
        mongodb_uri = os.getenv("MONGODB_URI")
        if mongodb_uri:
            uri = mongodb_uri
            print(f"Utilisation de MONGODB_URI: {uri}")
        else:
            username = quote_plus(os.getenv("MONGODB_USERNAME", "ksaidi"))
            password = quote_plus(os.getenv("MONGODB_PASSWORD", "KCS1234"))
            cluster = os.getenv("MONGODB_CLUSTER", "cluster0.tiyoz6j.mongodb.net")
            db_name = os.getenv("MONGODB_DATABASE", "cluster0")
            uri = f"mongodb+srv://{username}:{password}@{cluster}/?retryWrites=true&w=majority&appName=Cluster0"
            print(f"URI construite: {uri}")
        
        # Utilisation du certificat personnel fourni par MongoDB
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            tlsCAFile=certifi.where()
        )
        client.admin.command('ping')
        print("Connexion MongoDB réussie!")
        db = client["budget_app"]
        users_collection = db['users']
        budgets_collection = db['budgets']
        
        budgets_collection.create_index([("userId", 1)], unique=True)
        return client, db, users_collection, budgets_collection
    except Exception as e:
        print(f"Méthode 1 échouée: {e}")
    
    # Méthode 2: Connexion avec paramètres SSL personnalisés
    try:
        print("Méthode 2: Connexion avec paramètres SSL modifiés...")
        # Utiliser directement l'URI fournie avec des paramètres SSL modifiés
        mongodb_uri = os.getenv("MONGODB_URI")
        if mongodb_uri:
            uri = mongodb_uri + "&tlsAllowInvalidCertificates=true"
        else:
            username = quote_plus(os.getenv("MONGODB_USERNAME", "ksaidi"))
            password = quote_plus(os.getenv("MONGODB_PASSWORD", "KCS1234"))
            cluster = os.getenv("MONGODB_CLUSTER", "cluster0.tiyoz6j.mongodb.net")
            uri = f"mongodb+srv://{username}:{password}@{cluster}/?retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true"
        
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000
        )
        client.admin.command('ping')
        print("Connexion MongoDB réussie!")
        db = client["budget_app"]
        users_collection = db['users']
        budgets_collection = db['budgets']
        budgets_collection.create_index([("userId", 1)], unique=True)
        return client, db, users_collection, budgets_collection
    except Exception as e:
        print(f"Méthode 2 échouée: {e}")
    
    # Méthode 3: Connexion avec URI simplifiée
    try:
        print("Méthode 3: Connexion avec URI simplifiée...")
        # Version simplifiée sans spécifier la base de données dans l'URI
        username = quote_plus(os.getenv("MONGODB_USERNAME", "ksaidi"))
        password = quote_plus(os.getenv("MONGODB_PASSWORD", "KCS1234"))
        uri = f"mongodb+srv://{username}:{password}@cluster0.tiyoz6j.mongodb.net/?retryWrites=true&w=majority"
        
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            tlsCAFile=certifi.where()
        )
        client.admin.command('ping')
        print("Connexion MongoDB réussie!")
        db = client["budget_app"]
        users_collection = db['users']
        budgets_collection = db['budgets']
        budgets_collection.create_index([("userId", 1)], unique=True)
        return client, db, users_collection, budgets_collection
    except Exception as e:
        print(f"Méthode 3 échouée: {e}")
    
    print("ERREUR: Toutes les tentatives de connexion ont échoué")
    return None, None, None, None



'''# Méthode 4: Connexion locale de secours
    try:
        print("Méthode 4: Tentative de connexion locale...")
        # Créer une base de données locale pour le développement en cas d'échec de toutes les autres méthodes
        local_client = MongoClient('localhost', 27017)
        local_client.admin.command('ping')
        print("Connexion MongoDB locale réussie!")
        local_db = local_client["budget_app_local"] 
        local_users_collection = local_db['users']
        return local_client, local_db, local_users_collection
    except Exception as e:
        print(f"Méthode 4 échouée: {e}")'''