from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.project import Project
from app.models.client import Client
from app.models.proposal import Proposal
from app import db
from datetime import datetime

class ProjectController:
    """Controlador para gerenciar operações relacionadas a projetos."""

    @staticmethod
    @jwt_required()
    def create():
        """Cria um novo projeto para o cliente autenticado."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado. Apenas clientes podem criar projetos."}), 403

        data = request.get_json()
        required_fields = ['title', 'description']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Título e descrição são obrigatórios."}), 400

        new_project = Project(
            title=data['title'],
            description=data['description'],
            skills_required=data.get('skills_required'),
            budget=data.get('budget'),
            deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None,
            client_id=int(client_id),
            status='open'
        )

        try:
            db.session.add(new_project)
            db.session.commit()
            return jsonify({"message": "Projeto criado com sucesso.", "project": new_project.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def get_all():
        """Lista todos os projetos, filtrando por função do usuário."""
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims['role']

        if role == 'client':
            projects = Project.query.filter_by(client_id=int(user_id)).all()
            return jsonify([project.to_dict() for project in projects]), 200
        elif role == 'freelancer':
            projects = Project.query.filter_by(status='open').all()
            return jsonify([project.to_dict() for project in projects]), 200
        else:
            return jsonify({"error": "Acesso não autorizado."}), 403

    @staticmethod
    @jwt_required()
    def get(project_id):
        """Obtém os detalhes de um projeto específico."""
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims['role']

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404

        if role == 'client' and project.client_id != int(user_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403
        elif role == 'freelancer' and project.status != 'open' and project.freelancer_id != int(user_id):
            return jsonify({"error": "Acesso não autorizado. Apenas projetos abertos ou associados ao freelancer são visíveis."}), 403
        elif role not in ['client', 'freelancer']:
            return jsonify({"error": "Acesso não autorizado."}), 403

        return jsonify(project.to_dict()), 200

    @staticmethod
    @jwt_required()
    def update(project_id):
        """Atualiza os dados de um projeto existente."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado."}), 403

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404
        if project.client_id != int(client_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403

        data = request.get_json()
        if not data:
            return jsonify({"error": "Nenhum dado fornecido para atualização."}), 400

        project.title = data.get('title', project.title)
        project.description = data.get('description', project.description)
        project.skills_required = data.get('skills_required', project.skills_required)
        project.budget = data.get('budget', project.budget)
        project.deadline = datetime.fromisoformat(data['deadline']) if data.get('deadline') else project.deadline
        project.status = data.get('status', project.status)

        try:
            db.session.commit()
            return jsonify({"message": "Projeto atualizado com sucesso.", "project": project.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def delete(project_id):
        """Deleta um projeto existente."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado."}), 403

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404
        if project.client_id != int(client_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403

        try:
            db.session.delete(project)
            db.session.commit()
            return jsonify({"message": "Projeto deletado com sucesso."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def complete(project_id):
        """Marca um projeto como concluído."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado. Apenas clientes podem marcar projetos como concluídos."}), 403

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404
        if project.client_id != int(client_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403
        if project.status != 'in_progress':
            return jsonify({"error": "Apenas projetos em andamento podem ser marcados como concluídos."}), 400
        if not project.freelancer_id:
            return jsonify({"error": "O projeto deve ter um freelancer associado para ser concluído."}), 400

        # Verifica se existe uma proposta aceita ou concluída pelo freelancer
        proposal = Proposal.query.filter_by(project_id=project_id, freelancer_id=project.freelancer_id).first()
        if not proposal or proposal.status not in ['accepted', 'completed_by_freelancer']:
            return jsonify({"error": "Nenhuma proposta aceita ou concluída pelo freelancer encontrada para este projeto."}), 400

        project.status = 'completed'

        try:
            db.session.commit()
            return jsonify({"message": "Projeto marcado como concluído com sucesso.", "project": project.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500