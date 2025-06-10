from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.message import Message
from app.models.project import Project
from app.models.client import Client
from app.models.freelancer import Freelancer
from app import db

class MessageController:
    """Controlador para gerenciar operações relacionadas a mensagens de chat."""

    @staticmethod
    @jwt_required()
    def send_message():
        """Envia uma mensagem vinculada a um projeto."""
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims['role']
        if role not in ['client', 'freelancer']:
            return jsonify({"error": "Acesso não autorizado. Apenas clientes e freelancers podem enviar mensagens."}), 403

        data = request.get_json()
        required_fields = ['project_id', 'receiver_id', 'receiver_role', 'content']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "ID do projeto, ID do destinatário, papel do destinatário e conteúdo são obrigatórios."}), 400

        project = Project.query.get(data['project_id'])
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404
        if project.status not in ['open', 'in_progress']:
            return jsonify({"error": "Mensagens só podem ser enviadas para projetos abertos ou em andamento."}), 400

        # Verifica se o usuário tem permissão para enviar mensagem neste projeto
        if role == 'client' and project.client_id != int(user_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403
        if role == 'freelancer' and project.freelancer_id != int(user_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não está associado ao freelancer."}), 403

        # Valida receiver_role e verifica se o destinatário existe
        if data['receiver_role'] not in ['client', 'freelancer']:
            return jsonify({"error": "Papel do destinatário inválido. Use 'client' ou 'freelancer'."}), 400
        if data['receiver_role'] == 'client':
            receiver = Client.query.get(data['receiver_id'])
            if not receiver or receiver.id != project.client_id:
                return jsonify({"error": "Destinatário inválido ou não associado ao projeto."}), 400
        else:  # receiver_role == 'freelancer'
            receiver = Freelancer.query.get(data['receiver_id'])
            if not receiver or receiver.id != project.freelancer_id:
                return jsonify({"error": "Destinatário inválido ou não associado ao projeto."}), 400

        new_message = Message(
            project_id=data['project_id'],
            sender_id=int(user_id),
            sender_role=role,
            receiver_id=data['receiver_id'],
            receiver_role=data['receiver_role'],
            content=data['content']
        )

        try:
            db.session.add(new_message)
            db.session.commit()
            return jsonify({"message": "Mensagem enviada com sucesso.", "message_data": new_message.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def get_project_messages(project_id):
        """Lista todas as mensagens de um projeto."""
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims['role']
        if role not in ['client', 'freelancer']:
            return jsonify({"error": "Acesso não autorizado. Apenas clientes e freelancers podem visualizar mensagens."}), 403

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404
        if role == 'client' and project.client_id != int(user_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403
        if role == 'freelancer' and project.freelancer_id != int(user_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não está associado ao freelancer."}), 403

        messages = Message.query.filter_by(project_id=project_id).order_by(Message.created_at.asc()).all()
        return jsonify([message.to_dict() for message in messages]), 200

    @staticmethod
    @jwt_required()
    def get_project_messages(project_id):
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims['role']

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404

        # Permitir que freelancers e clientes acessem mensagens do projeto
        if role == 'client' and project.client_id != int(user_id):
            return jsonify({"error": "Acesso não autorizado."}), 403
        elif role == 'freelancer' and project.freelancer_id != int(user_id):
            return jsonify({"error": "Acesso não autorizado."}), 403

        messages = Message.query.filter_by(project_id=project_id).all()
        return jsonify([message.to_dict() for message in messages]), 200