import os
from pathlib import Path

class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Database settings
    DATABASE_PATH = os.environ.get('DATABASE_PATH') or 'veda_analytics.db'
    
    # Data paths
    BASE_DIR = Path(__file__).parent.parent
    ARTICLES_FOLDER = os.environ.get('ARTICLES_FOLDER') or str(BASE_DIR / 'data' / 'articles')
    GRAPH_DATA = os.environ.get('GRAPH_DATA') or str(BASE_DIR / 'data' / 'knowledge_graph.json')
    
    # API settings
    API_HOST = os.environ.get('API_HOST', '0.0.0.0')
    API_PORT = int(os.environ.get('API_PORT', 5000))
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Analysis settings
    MAX_ARTICLES_PER_REQUEST = int(os.environ.get('MAX_ARTICLES_PER_REQUEST', 100))
    SENTIMENT_THRESHOLD_POSITIVE = float(os.environ.get('SENTIMENT_THRESHOLD_POSITIVE', 0.1))
    SENTIMENT_THRESHOLD_NEGATIVE = float(os.environ.get('SENTIMENT_THRESHOLD_NEGATIVE', -0.1))
    
    # Optional: OpenAI API settings for enhanced analysis
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    @staticmethod
    def init_app(app):
        """Initialize app with configuration"""
        # Ensure data directories exist
        os.makedirs(Config.ARTICLES_FOLDER, exist_ok=True)
        os.makedirs(os.path.dirname(Config.GRAPH_DATA), exist_ok=True)

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'production-secret-key'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATABASE_PATH = ':memory:'  # Use in-memory database for testing

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
