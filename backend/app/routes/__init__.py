from flask import Blueprint
from app.routes.client_routes import client_bp
from app.routes.freelancer_routes import freelancer_bp
from app.routes.project_routes import project_bp
from app.routes.proposal_routes import proposal_bp
from app.routes.admin_routes import admin_bp

def register_routes(app):
    """Registra todos os Blueprints de rotas na aplicação Flask."""
    
    app.register_blueprint(client_bp, url_prefix='/client')

    app.register_blueprint(freelancer_bp, url_prefix='/freelancer')

    app.register_blueprint(project_bp, url_prefix='/project')

    app.register_blueprint(proposal_bp, url_prefix='/proposal')

    app.register_blueprint(admin_bp, url_prefix='/admin')