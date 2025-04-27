from flask import Blueprint
from app.controllers.project_controller import ProjectController

# Cria um Blueprint para rotas relacionadas a projetos
project_bp = Blueprint('project', __name__)

@project_bp.route('/create', methods=['POST'])
def create():
    """Rota para criar um novo projeto."""
    return ProjectController.create()

@project_bp.route('/all', methods=['GET'])
def get_all():
    """Rota para listar todos os projetos do cliente autenticado."""
    return ProjectController.get_all()

@project_bp.route('/<int:project_id>', methods=['GET'])
def get(project_id):
    """Rota para obter os detalhes de um projeto específico."""
    return ProjectController.get(project_id)

@project_bp.route('/<int:project_id>', methods=['PUT'])
def update(project_id):
    """Rota para atualizar um projeto existente."""
    return ProjectController.update(project_id)

@project_bp.route('/<int:project_id>', methods=['DELETE'])
def delete(project_id):
    """Rota para deletar um projeto existente."""
    return ProjectController.delete(project_id)