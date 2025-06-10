from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models.project import Project
from app.models.freelancer import Freelancer
from app.models.skill import Skill, freelancer_skills, project_skills
from app.models.review import Review
from app import db
from sqlalchemy.sql import func

class RecommendationController:
    """Controlador para gerenciar recomendações de freelancers para projetos."""

    @staticmethod
    @jwt_required()
    def get_recommendations(project_id):
        """Gera uma lista de freelancers recomendados para um projeto."""
        client_id = get_jwt_identity()
        claims = get_jwt()
        if claims['role'] != 'client':
            return jsonify({"error": "Acesso não autorizado. Apenas clientes podem obter recomendações."}), 403

        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Projeto não encontrado."}), 404
        if project.client_id != int(client_id):
            return jsonify({"error": "Acesso não autorizado. Este projeto não pertence ao cliente."}), 403

        # Obtém as habilidades requeridas pelo projeto
        project_skills_query = db.session.query(Skill).join(project_skills).filter(project_skills.c.project_id == project_id).all()
        project_skill_ids = [skill.id for skill in project_skills_query]

        if not project_skill_ids:
            return jsonify({"message": "Nenhuma habilidade associada ao projeto. Recomendações baseadas apenas em avaliações."}), 200

        # Busca freelancers com pelo menos uma habilidade correspondente
        matching_freelancers = db.session.query(Freelancer).join(freelancer_skills).filter(
            freelancer_skills.c.skill_id.in_(project_skill_ids)
        ).all()

        # Calcula uma pontuação para cada freelancer com base em habilidades e avaliações
        recommendations = []
        for freelancer in matching_freelancers:
            # Conta quantas habilidades do projeto o freelancer possui
            freelancer_skill_ids = [skill.id for skill in freelancer.skill_set]
            matching_skills = len(set(project_skill_ids).intersection(freelancer_skill_ids))
            skill_match_score = matching_skills / len(project_skill_ids) if project_skill_ids else 0

            # Calcula a média das avaliações do freelancer
            avg_rating = db.session.query(func.avg(Review.rating)).filter_by(freelancer_id=freelancer.id).scalar() or 0
            review_count = Review.query.filter_by(freelancer_id=freelancer.id).count()

            # Pontuação combinada (50% habilidades, 50% avaliações)
            score = (0.5 * skill_match_score) + (0.5 * (avg_rating / 5.0)) if avg_rating else skill_match_score

            recommendations.append({
                'freelancer': freelancer.to_dict(),
                'score': round(score, 2),
                'matching_skills': matching_skills,
                'average_rating': round(avg_rating, 1) if avg_rating else None,
                'review_count': review_count
            })

        # Ordena por pontuação (maior para menor)
        recommendations.sort(key=lambda x: x['score'], reverse=True)

        return jsonify({
            "message": "Recomendações geradas com sucesso.",
            "recommendations": recommendations
        }), 200