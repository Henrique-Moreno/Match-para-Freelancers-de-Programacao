from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models.freelancer import Freelancer
from app import db
from werkzeug.security import check_password_hash

class FreelancerController:
    """Controlador para gerenciar operações relacionadas a freelancers."""

    @staticmethod
    def register():
        """Registra um novo freelancer."""
        data = request.get_json()
        
        required_fields = ['name', 'email', 'password']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Nome, email e senha são obrigatórios."}), 400
        
        # Verifica se o email já está em uso
        existing_freelancer = Freelancer.query.filter_by(email=data['email']).first()
        if existing_freelancer:
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
            return jsonify({"message": "Freelancer registrado com sucesso."}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def login():
        """Realiza o login do freelancer."""
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email e senha são obrigatórios."}), 400

        freelancer = Freelancer.query.filter_by(email=data['email']).first()
        
        if freelancer and freelancer.check_password(data['password']):
            access_token = create_access_token(identity=str(freelancer.id), additional_claims={'role': freelancer.role})
            return jsonify({
                "message": "Login bem-sucedido.",
                "access_token": access_token,
                "role": freelancer.role
            }), 200
        
        return jsonify({"error": "Email ou senha incorretos."}), 401

    @staticmethod
    @jwt_required()
    def logout():
        """Realiza o logout do freelancer (gerenciado pelo frontend)."""
        return jsonify({"message": "Logout bem-sucedido."}), 200

    @staticmethod
    @jwt_required()
    def get_profile():
        """Retorna o perfil do freelancer autenticado."""
        freelancer_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'freelancer':
            return jsonify({"error": "Acesso não autorizado."}), 403
        
        freelancer = Freelancer.query.get(int(freelancer_id))
        if not freelancer:
            return jsonify({"error": "Freelancer não encontrado."}), 404
        
        return jsonify(freelancer.to_dict()), 200

    @staticmethod
    @jwt_required()
    def update_profile():
        """Atualiza o perfil do freelancer autenticado."""
        freelancer_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'freelancer':
            return jsonify({"error": "Acesso não autorizado."}), 403
        
        freelancer = Freelancer.query.get(int(freelancer_id))
        if not freelancer:
            return jsonify({"error": "Freelancer não encontrado."}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Nenhum dado fornecido para atualização."}), 400

        freelancer.name = data.get('name', freelancer.name)
        freelancer.skills = data.get('skills', freelancer.skills)
        freelancer.portfolio_url = data.get('portfolio_url', freelancer.portfolio_url)
        freelancer.phone = data.get('phone', freelancer.phone)
        if 'password' in data:
            freelancer.set_password(data['password'])
        
        try:
            db.session.commit()
            return jsonify({"message": "Perfil atualizado com sucesso.", "freelancer": freelancer.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    @jwt_required()
    def get_me():
        """Obtém os dados do freelancer autenticado."""
        freelancer_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'freelancer':
            return jsonify({"error": "Acesso não autorizado."}), 403

        freelancer = Freelancer.query.get(freelancer_id)
        if not freelancer:
            return jsonify({"error": "Freelancer não encontrado."}), 404

        return jsonify(freelancer.to_dict()), 200