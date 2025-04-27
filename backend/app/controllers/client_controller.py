from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models.client import Client
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