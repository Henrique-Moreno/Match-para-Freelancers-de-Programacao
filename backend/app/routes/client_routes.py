from flask import Blueprint
from app.controllers.client_controller import ClientController

# Cria um Blueprint para rotas relacionadas a clientes
client_bp = Blueprint('client', __name__)

@client_bp.route('/register', methods=['POST'])
def register():
    """Rota para registrar um novo cliente."""
    return ClientController.register()

@client_bp.route('/login', methods=['POST'])
def login():
    """Rota para realizar login do cliente."""
    return ClientController.login()

@client_bp.route('/logout', methods=['POST'])
def logout():
    """Rota para realizar logout do cliente."""
    return ClientController.logout()

@client_bp.route('/profile', methods=['GET'])
def get_profile():
    """Rota para obter o perfil do cliente autenticado."""
    return ClientController.get_profile()

@client_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Rota para atualizar o perfil do cliente autenticado."""
    return ClientController.update_profile()