from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config

# Inicializa extensões globalmente
db = SQLAlchemy()
login_manager = LoginManager()
jwt = JWTManager()

def create_app():
    """Factory function para criar e configurar a aplicação Flask."""
    app = Flask(__name__)
    
    # Carrega configurações da classe Config
    app.config.from_object(Config)
    
    # Inicializa extensões com a aplicação
    db.init_app(app)
    login_manager.init_app(app)
    jwt.init_app(app)

    CORS(app, resources={r"/*": {"origins": "*"}},  
         supports_credentials=True, 
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Configura o LoginManager
    login_manager.login_view = 'user.login'  # Rota do blueprint 'user'

    # Importa as models para garantir que as tabelas sejam criadas
    from app.models.client import Client
    from app.models.freelancer import Freelancer
    from app.models.project import Project
    from app.models.proposal import Proposal
    from app.models.admin import Admin
    from app.models.message import Message
    from app.models.review import Review
    from app.models.skill import Skill, freelancer_skills, project_skills
    
    # Cria as tabelas do banco no contexto da aplicação
    with app.app_context():
        db.create_all()

    # Importa e registra os Blueprints de rotas
    from app.routes import register_routes
    register_routes(app)
    
    # Rota de teste
    @app.route('/')
    def hello_world():
        """Rota inicial para testar a API."""
        return 'Hello, World! Welcome to Match Freelancer API'
    
    return app