from flask import Blueprint
from app.controllers.admin_controller import AdminController

# Cria um Blueprint para rotas relacionadas a administradores
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/login', methods=['POST'])
def login():
    """Rota para login de administrador."""
    return AdminController.login()

@admin_bp.route('/clients', methods=['GET'])
def get_all_clients():
    """Rota para listar todos os clientes."""
    return AdminController.get_all_clients()

@admin_bp.route('/freelancers', methods=['GET'])
def get_all_freelancers():
    """Rota para listar todos os freelancers."""
    return AdminController.get_all_freelancers()

@admin_bp.route('/client', methods=['POST'])
def create_client():
    """Rota para criar um novo cliente."""
    return AdminController.create_client()

@admin_bp.route('/freelancer', methods=['POST'])
def create_freelancer():
    """Rota para criar um novo freelancer."""
    return AdminController.create_freelancer()

@admin_bp.route('/client/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    """Rota para atualizar um cliente existente."""
    return AdminController.update_client(client_id)

@admin_bp.route('/freelancer/<int:freelancer_id>', methods=['PUT'])
def update_freelancer(freelancer_id):
    """Rota para atualizar um freelancer existente."""
    return AdminController.update_freelancer(freelancer_id)

@admin_bp.route('/client/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    """Rota para deletar um cliente existente."""
    return AdminController.delete_client(client_id)

@admin_bp.route('/freelancer/<int:freelancer_id>', methods=['DELETE'])
def delete_freelancer(freelancer_id):
    """Rota para deletar um freelancer existente."""
    return AdminController.delete_freelancer(freelancer_id)

@admin_bp.route('/projects', methods=['GET'])
def get_all_projects():
    """Rota para listar todos os projetos."""
    return AdminController.get_all_projects()

@admin_bp.route('/proposals', methods=['GET'])
def get_all_proposals():
    """Rota para listar todas as propostas."""
    return AdminController.get_all_proposals()

@admin_bp.route('/project/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Rota para atualizar um projeto existente."""
    return AdminController.update_project(project_id)

@admin_bp.route('/project/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Rota para deletar um projeto existente."""
    return AdminController.delete_project(project_id)

@admin_bp.route('/proposal/<int:proposal_id>', methods=['PUT'])
def update_proposal(proposal_id):
    """Rota para atualizar uma proposta existente."""
    return AdminController.update_proposal(proposal_id)

@admin_bp.route('/proposal/<int:proposal_id>', methods=['DELETE'])
def delete_proposal(proposal_id):
    """Rota para deletar uma proposta existente."""
    return AdminController.delete_proposal(proposal_id)