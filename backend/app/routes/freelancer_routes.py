from flask import Blueprint
from app.controllers.freelancer_controller import FreelancerController

# Cria um Blueprint para rotas relacionadas a freelancers
freelancer_bp = Blueprint('freelancer', __name__)

@freelancer_bp.route('/register', methods=['POST'])
def register():
    """Rota para registrar um novo freelancer."""
    return FreelancerController.register()

@freelancer_bp.route('/login', methods=['POST'])
def login():
    """Rota para realizar login do freelancer."""
    return FreelancerController.login()

@freelancer_bp.route('/logout', methods=['POST'])
def logout():
    """Rota para realizar logout do freelancer."""
    return FreelancerController.logout()

@freelancer_bp.route('/profile', methods=['GET'])
def get_profile():
    """Rota para obter o perfil do freelancer autenticado."""
    return FreelancerController.get_profile()

@freelancer_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Rota para atualizar o perfil do freelancer autenticado."""
    return FreelancerController.update_profile()

@freelancer_bp.route('/me', methods=['GET'])
def get_me():
    """Rota para obter os dados do freelancer autenticado."""
    return FreelancerController.get_me()

@freelancer_bp.route('/update', methods=['PUT'])
def update():
    """Rota para atualizar os dados do freelancer autenticado."""
    return FreelancerController.update()