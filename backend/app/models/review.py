from app import db
from datetime import datetime

class Review(db.Model):
    """Modelo que representa uma avaliação de um freelancer feita por um cliente após a conclusão de um projeto."""

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id', ondelete='CASCADE'), nullable=False)  # Chave estrangeira para o projeto
    freelancer_id = db.Column(db.Integer, db.ForeignKey('freelancer.id', ondelete='CASCADE'), nullable=False)  # Chave estrangeira para o freelancer
    client_id = db.Column(db.Integer, db.ForeignKey('client.id', ondelete='CASCADE'), nullable=False)  # Chave estrangeira para o cliente
    rating = db.Column(db.Integer, nullable=False)  # Nota de 1 a 5
    comment = db.Column(db.Text)  # Comentário opcional
    created_at = db.Column(db.DateTime, default=datetime.today, nullable=False)

    # Relacionamentos
    project = db.relationship('Project', backref=db.backref('reviews', lazy=True, cascade='all, delete'))
    freelancer = db.relationship('Freelancer', backref=db.backref('reviews', lazy=True, cascade='all, delete'))
    client = db.relationship('Client', backref=db.backref('reviews', lazy=True, cascade='all, delete'))

    def to_dict(self):
        """Converte o modelo para um dicionário."""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'freelancer_id': self.freelancer_id,
            'client_id': self.client_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        """Representação em string do modelo Review."""
        return f'<Review {self.id} for Freelancer {self.freelancer_id}>'