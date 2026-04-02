import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')