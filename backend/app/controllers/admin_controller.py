from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models.admin import Admin
from app.models.client import Client
from app.models.freelancer import Freelancer
from app.models.project import Project
from app.models.proposal import Proposal
from app import db
from datetime import datetime

class AdminController:
    """Controlador para gerenciar operações administrativas."""

    @staticmethod
    def login():
        """Realiza o login do administrador."""
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email e senha são obrigatórios."}), 400

        admin = Admin.query.filter_by(email=data['email']).first()
        if admin and admin.check_password(data['password']):
            access_token = create_access_token(identity=str(admin.id), additional_claims={'role': admin.role})
            return jsonify({
                "message": "Login bem-sucedido.",
                "access_token": access_token,
                "role": admin.role
            }), 200

        return jsonify({"error": "Email ou senha incorretos."}), 401

    @staticmethod
    @jwt_required()
    def get_all_clients():
        """Lista todos os clientes do sistema."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        clients = Client.query.all()
        return jsonify([client.to_dict() for client in clients]), 200

    @staticmethod
    @jwt_required()
    def get_all_freelancers():
        """Lista todos os freelancers do sistema."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        freelancers = Freelancer.query.all()
        return jsonify([freelancer.to_dict() for freelancer in freelancers]), 200

    @staticmethod
    @jwt_required()
    def create_client():
        """Cria um novo cliente."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        data = request.get_json()
        required_fields = ['name', 'email', 'password']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Nome, email e senha são obrigatórios."}), 400

        if Client.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email já está em uso."}), 400

        new_client = Client(
            name=data['name'],
            email=data['email'],
            company=data.get('company'),
            phone=data.get('phone')
        )
        new_client.set_password(data['password'])

        try:
            db.session.add(new_client)
            db.session.commit()
            return jsonify({"message": "Cliente criado com sucesso.", "client": new_client.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def create_freelancer():
        """Cria um novo freelancer."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        data = request.get_json()
        required_fields = ['name', 'email', 'password']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Nome, email e senha são obrigatórios."}), 400

        if Freelancer.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email já está em uso."}), 400

        new_freelancer = Freelancer(
            name=data['name'],
            email=data['email'],
            skills=data.get('skills'),
            portfolio_url=data.get('portfolio_url'),
            phone=data.get('phone')
        )
        new_freelancer.set_password(data['password'])

        try:
            db.session.add(new_freelancer)
            db.session.commit()
            return jsonify({"message": "Freelancer criado com sucesso.", "freelancer": new_freelancer.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def update_client(client_id):
        """Atualiza os dados de um cliente existente."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        client = Client.query.get(client_id)
        if not client:
            return jsonify({"error": "Cliente não encontrado."}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "Nenhum dado fornecido para atualização."}), 400

        client.name = data.get('name', client.name)
        client.email = data.get('email', client.email)
        client.company = data.get('company', client.company)
        client.phone = data.get('phone', client.phone)
        if 'password' in data:
            client.set_password(data['password'])

        try:
            db.session.commit()
            return jsonify({"message": "Cliente atualizado com sucesso.", "client": client.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def update_freelancer(freelancer_id):
        """Atualiza os dados de um freelancer existente."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        freelancer = Freelancer.query.get(freelancer_id)
        if not freelancer:
            return jsonify({"error": "Freelancer não encontrado."}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "Nenhum dado fornecido para atualização."}), 400

        freelancer.name = data.get('name', freelancer.name)
        freelancer.email = data.get('email', freelancer.email)
        freelancer.skills = data.get('skills', freelancer.skills)
        freelancer.portfolio_url = data.get('portfolio_url', freelancer.portfolio_url)
        freelancer.phone = data.get('phone', freelancer.phone)
        if 'password' in data:
            freelancer.set_password(data['password'])

        try:
            db.session.commit()
            return jsonify({"message": "Freelancer atualizado com sucesso.", "freelancer": freelancer.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def delete_client(client_id):
        """Deleta um cliente existente."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        client = Client.query.get(client_id)
        if not client:
            return jsonify({"error": "Cliente não encontrado."}), 404

        try:
            db.session.delete(client)
            db.session.commit()
            return jsonify({"message": "Cliente deletado com sucesso."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def delete_freelancer(freelancer_id):
        """Deleta um freelancer existente."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        freelancer = Freelancer.query.get(freelancer_id)
        if not freelancer:
            return jsonify({"error": "Freelancer não encontrado."}), 404

        try:
            db.session.delete(freelancer)
            db.session.commit()
            return jsonify({"message": "Freelancer deletado com sucesso."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def get_all_projects():
        """Lista todos os projetos do sistema."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        projects = Project.query.all()
        return jsonify([project.to_dict() for project in projects]), 200

    @staticmethod
    @jwt_required()
    def get_all_proposals():
        """Lista todas as propostas do sistema."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        proposals = Proposal.query.all()
        return jsonify([proposal.to_dict() for proposal in proposals]), 200

    @staticmethod
    @jwt_required()
    def update_project(project_id):
        """Atualiza os dados de um projeto existente."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404

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
    def delete_project(project_id):
        """Deleta um projeto existente."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404

        try:
            db.session.delete(project)
            db.session.commit()
            return jsonify({"message": "Projeto deletado com sucesso."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def update_proposal(proposal_id):
        """Atualiza o status de uma proposta."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        proposal = Proposal.query.get(proposal_id)
        if not proposal:
            return jsonify({"error": "Proposta não encontrada."}), 404

        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({"error": "Status é obrigatório para atualização."}), 400

        valid_statuses = ['pending', 'accepted', 'rejected']
        if data['status'] not in valid_statuses:
            return jsonify({"error": f"Status inválido. Use: {', '.join(valid_statuses)}."}), 400

        if data['status'] == 'accepted':
            existing_accepted = Proposal.query.filter_by(project_id=proposal.project_id, status='accepted').first()
            if existing_accepted and existing_accepted.id != proposal.id:
                return jsonify({"error": "Já existe uma proposta aceita para este projeto."}), 400

        proposal.status = data['status']
        if data['status'] == 'accepted':
            project = Project.query.get(proposal.project_id)
            project.status = 'in_progress'

        try:
            db.session.commit()
            return jsonify({"message": "Proposta atualizada com sucesso.", "proposal": proposal.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def delete_proposal(proposal_id):
        """Deleta uma proposta existente."""
        claims = get_jwt()
        if claims['role'] != 'admin':
            return jsonify({"error": "Acesso não autorizado. Apenas administradores podem acessar."}), 403

        proposal = Proposal.query.get(proposal_id)
        if not proposal:
            return jsonify({"error": "Proposta não encontrada."}), 404

        try:
            db.session.delete(proposal)
            db.session.commit()
            return jsonify({"message": "Proposta deletada com sucesso."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500