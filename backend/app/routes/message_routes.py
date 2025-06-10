from flask import Blueprint
from app.controllers.message_controller import MessageController

# Cria um Blueprint para rotas relacionadas a mensagens
message_bp = Blueprint('message', __name__)

@message_bp.route('/', methods=['POST'])
def send_message():
    """Rota para enviar uma mensagem vinculada a um projeto."""
    return MessageController.send_message()

@message_bp.route('/project/<int:project_id>', methods=['GET'])
def get_project_messages(project_id):
    """Rota para listar todas as mensagens de um projeto."""
    return MessageController.get_project_messages(project_id)