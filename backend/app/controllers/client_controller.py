from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models.client import Client
from app.models.project import Project
from app.models.review import Review
from app import db
from werkzeug.security import check_password_hash

class ClientController:
    """Controlador para gerenciar operações relacionadas a clientes."""

    @staticmethod
    def register():
        """Registra um novo cliente."""
        data = request.get_json()
        
        required_fields = ['name', 'email', 'password']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Nome, email e senha são obrigatórios."}), 400
        
        # Verifica se o email já está em uso
        existing_client = Client.query.filter_by(email=data['email']).first()
        if existing_client:
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
            return jsonify({"message": "Cliente registrado com sucesso."}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def login():
        """Realiza o login do cliente."""
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email e senha são obrigatórios."}), 400

        client = Client.query.filter_by(email=data['email']).first()
        
        if client and client.check_password(data['password']):
            access_token = create_access_token(identity=str(client.id), additional_claims={'role': client.role})
            return jsonify({
                "message": "Login bem-sucedido.",
                "access_token": access_token,
                "role": client.role
            }), 200
        
        return jsonify({"error": "Email ou senha incorretos."}), 401

    @staticmethod
    @jwt_required()
    def logout():
        """Realiza o logout do cliente (gerenciado pelo frontend)."""
        return jsonify({"message": "Logout bem-sucedido."}), 200

    @staticmethod
    @jwt_required()
    def get_profile():
        """Retorna o perfil do cliente autenticado."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado."}), 403
        
        client = Client.query.get(int(client_id))
        if not client:
            return jsonify({"error": "Cliente não encontrado."}), 404
        
        return jsonify(client.to_dict()), 200

    @staticmethod
    @jwt_required()
    def update_profile():
        """Atualiza o perfil do cliente autenticado."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado."}), 403
        
        client = Client.query.get(int(client_id))
        if not client:
            return jsonify({"error": "Cliente não encontrado."}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Nenhum dado fornecido para atualização."}), 400

        client.name = data.get('name', client.name)
        client.company = data.get('company', client.company)
        client.phone = data.get('phone', client.phone)
        if 'password' in data:
            client.set_password(data['password'])
        
        try:
            db.session.commit()
            return jsonify({"message": "Perfil atualizado com sucesso.", "client": client.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def delete_account():
        """Deleta a conta do cliente autenticado."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado."}), 403

        client = Client.query.get(int(client_id))
        if not client:
            return jsonify({"error": "Cliente não encontrado."}), 404

        try:
            db.session.delete(client)
            db.session.commit()
            return jsonify({"message": "Conta deletada com sucesso."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @jwt_required()
    def create_review():
        """Cria uma avaliação para um freelancer após a conclusão de um projeto."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado. Apenas clientes podem criar avaliações."}), 403

        data = request.get_json()
        required_fields = ['project_id', 'freelancer_id', 'rating']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "ID do projeto, ID do freelancer e nota são obrigatórios."}), 400

        project = Project.query.get(data['project_id'])
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404
        if project.client_id != int(client_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403
        if project.status != 'completed':
            return jsonify({"error": "Avaliações só podem ser feitas para projetos concluídos."}), 400
        if project.freelancer_id != data['freelancer_id']:
            return jsonify({"error": "O freelancer informado não está associado a este projeto."}), 400

        # Valida a nota (1 a 5)
        rating = data['rating']
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({"error": "A nota deve ser um número inteiro entre 1 e 5."}), 400

        # Verifica se já existe uma avaliação para este projeto e freelancer
        existing_review = Review.query.filter_by(project_id=data['project_id'], freelancer_id=data['freelancer_id']).first()
        if existing_review:
            return jsonify({"error": "Já existe uma avaliação para este projeto e freelancer."}), 400

        new_review = Review(
            project_id=data['project_id'],
            freelancer_id=data['freelancer_id'],
            client_id=int(client_id),
            rating=rating,
            comment=data.get('comment')
        )

        try:
            db.session.add(new_review)
            db.session.commit()
            return jsonify({"message": "Avaliação criada com sucesso.", "review": new_review.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500