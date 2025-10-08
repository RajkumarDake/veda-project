import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from database import BiasAnalyzer, DatabaseManager
from neo4j_manager import Neo4jManager
from routes import register_routes
from neo4j_routes import neo4j_bp


def create_app():
    # Load environment variables from .env if present
    try:
        # Load .env from project root directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        env_path = os.path.join(project_root, '.env')
        load_dotenv(env_path)
        print(f"Loading .env from: {env_path}")
    except Exception as e:
        print(f"Could not load .env file: {e}")
        pass
    app = Flask(__name__)
    CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'])

    # Paths/config
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    articles_folder = os.path.join(project_root, 'data', 'article')

    app.config['DATABASE'] = 'veda_analytics.db'
    app.config['ARTICLES_FOLDER'] = articles_folder
    app.config['GRAPH_DATA'] = os.path.join(project_root, 'data', 'knowledge_graph.json')
    app.config['MC1_JSON_PATH'] = os.path.join(project_root, 'mc1.json')

    # Neo4j (supports local and cloud)
    app.config['NEO4J_URI'] = os.getenv('NEO4J_URI', 'neo4j://127.0.0.1:7687')
    app.config['NEO4J_USER'] = os.getenv('NEO4J_USER', 'neo4j')
    app.config['NEO4J_PASSWORD'] = os.getenv('NEO4J_PASSWORD', 'Veda@123')
    
    # Debug: Print loaded configuration
    print(f"Neo4j Configuration:")
    print(f"  URI: {app.config['NEO4J_URI']}")
    print(f"  USER: {app.config['NEO4J_USER']}")
    print(f"  PASSWORD: {'*' * len(app.config['NEO4J_PASSWORD']) if app.config['NEO4J_PASSWORD'] else 'None'}")

    # Init services
    bias_analyzer = BiasAnalyzer()
    db_manager = DatabaseManager(app.config['DATABASE'])

    neo4j_manager = None
    try:
        neo4j_manager = Neo4jManager(
            app.config['NEO4J_URI'],
            app.config['NEO4J_USER'],
            app.config['NEO4J_PASSWORD']
        )
    except Exception as e:
        print(f"Failed to initialize Neo4j manager: {e}")
        neo4j_manager = None

    # Minimal request logging (skip health/preflight)
    @app.before_request
    def _log_req():
        from flask import request
        if request.path == '/api/health' or request.method == 'OPTIONS':
            return
        print(f"Request: {request.method} {request.url}")

    @app.after_request
    def _log_resp(response):
        from flask import request
        if request.path == '/api/health' or request.method == 'OPTIONS':
            return response
        print(f"Response: {response.status_code}")
        return response

    # Store neo4j_manager in app context for blueprint access
    app.neo4j_manager = neo4j_manager
    
    # Routes
    register_routes(app, bias_analyzer, db_manager, neo4j_manager)
    app.register_blueprint(neo4j_bp, url_prefix='/api')
    return app


