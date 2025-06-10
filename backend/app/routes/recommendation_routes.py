from flask import Blueprint
from app.controllers.recommendation_controller import RecommendationController

# Cria um Blueprint para rotas relacionadas a recomendações
recommendation_bp = Blueprint('recommendation', __name__)

@recommendation_bp.route('/project/<int:project_id>', methods=['GET'])
def get_recommendations(project_id):
    """Rota para obter recomendações de freelancers para um projeto."""
    return RecommendationController.get_recommendations(project_id)