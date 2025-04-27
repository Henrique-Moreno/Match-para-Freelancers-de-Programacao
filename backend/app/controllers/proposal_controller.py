from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.proposal import Proposal
from app.models.project import Project
from app.models.freelancer import Freelancer
from app import db

class ProposalController:
    """Controlador para gerenciar operações relacionadas a propostas."""

    @staticmethod
    @jwt_required()
    def create():
        """Cria uma nova proposta para um projeto (apenas freelancers)."""
        freelancer_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'freelancer':
            return jsonify({"error": "Acesso não autorizado. Apenas freelancers podem enviar propostas."}), 403

        data = request.get_json()
        required_fields = ['project_id', 'bid_amount']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "ID do projeto e valor da proposta são obrigatórios."}), 400

        project = Project.query.get(data['project_id'])
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404
        if project.status != 'open':
            return jsonify({"error": "Não é possível enviar propostas para projetos que não estão abertos."}), 400

        new_proposal = Proposal(
            project_id=data['project_id'],
            freelancer_id=int(freelancer_id),
            bid_amount=data['bid_amount'],
            estimated_days=data.get('estimated_days'),
            message=data.get('message'),
            status='pending'
        )

        try:
            db.session.add(new_proposal)
            db.session.commit()
            return jsonify({"message": "Proposta criada com sucesso.", "proposal": new_proposal.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def get_all(project_id):
        """Lista todas as propostas de um projeto (apenas o cliente dono do projeto)."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado."}), 403

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404
        if project.client_id != int(client_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403

        proposals = Proposal.query.filter_by(project_id=project_id).all()
        return jsonify([proposal.to_dict() for proposal in proposals]), 200

    @staticmethod
    @jwt_required()
    def get(proposal_id):
        """Obtém os detalhes de uma proposta específica."""
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims['role']

        proposal = Proposal.query.get(proposal_id)
        if not proposal:
            return jsonify({"error": "Proposta não encontrada."}), 404

        if role == 'client':
            project = Project.query.get(proposal.project_id)
            if project.client_id != int(user_id):
                return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403
        elif role == 'freelancer':
            if proposal.freelancer_id != int(user_id):
                return jsonify({"error": "Acesso não autorizado. Esta proposta não pertence ao freelancer."}), 403
        else:
            return jsonify({"error": "Acesso não autorizado."}), 403

        return jsonify(proposal.to_dict()), 200

    @staticmethod
    @jwt_required()
    def update(proposal_id):
        """Atualiza o status de uma proposta (apenas clientes)."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado. Apenas clientes podem atualizar propostas."}), 403

        proposal = Proposal.query.get(proposal_id)
        if not proposal:
            return jsonify({"error": "Proposta não encontrada."}), 404

        project = Project.query.get(proposal.project_id)
        if project.client_id != int(client_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403

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
            project.status = 'in_progress'

        try:
            db.session.commit()
            return jsonify({"message": "Proposta atualizada com sucesso.", "proposal": proposal.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def delete(proposal_id):
        """Deleta uma proposta (freelancer ou cliente do projeto)."""
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims['role']

        proposal = Proposal.query.get(proposal_id)
        if not proposal:
            return jsonify({"error": "Proposta não encontrada."}), 404

        if role == 'client':
            project = Project.query.get(proposal.project_id)
            if project.client_id != int(user_id):
                return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403
        elif role == 'freelancer':
            if proposal.freelancer_id != int(user_id):
                return jsonify({"error": "Acesso não autorizado. Esta proposta não pertence ao freelancer."}), 403
        else:
            return jsonify({"error": "Acesso não autorizado."}), 403

        try:
            db.session.delete(proposal)
            db.session.commit()
            return jsonify({"message": "Proposta deletada com sucesso."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def get_freelancer_proposals():
        """Lista todas as propostas do freelancer autenticado."""
        freelancer_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'freelancer':
            return jsonify({"error": "Acesso não autorizado. Apenas freelancers podem listar suas propostas."}), 403

        proposals = Proposal.query.filter_by(freelancer_id=int(freelancer_id)).all()
        return jsonify([proposal.to_dict() for proposal in proposals]), 200