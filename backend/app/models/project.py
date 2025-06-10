from app import db
from datetime import datetime

class Project(db.Model):
    """Modelo que representa um projeto publicado por um cliente no sistema de Match para Freelancers."""

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)  
    description = db.Column(db.Text, nullable=False)  
    skills_required = db.Column(db.Text)  
    budget = db.Column(db.Float)  
    deadline = db.Column(db.DateTime)  
    status = db.Column(db.String(20), default='open', nullable=False)  # Status do projeto (ex: 'open', 'in progress', 'completed')
    client_id = db.Column(db.Integer, db.ForeignKey('client.id', ondelete='CASCADE'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('freelancer.id', ondelete='SET NULL'), nullable=True)  # Freelancer contratado
    created_at = db.Column(db.DateTime, default=datetime.today, nullable=False)  

    # Relacionamentos
    client = db.relationship('Client', backref=db.backref('projects', lazy=True, cascade='all, delete'))
    freelancer = db.relationship('Freelancer', backref=db.backref('projects', lazy=True))

    def to_dict(self):
        """Converte o modelo para um dicionário."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'skills_required': self.skills_required,
            'budget': self.budget,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'status': self.status,
            'client_id': self.client_id,
            'freelancer_id': self.freelancer_id,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        """Representação em string do modelo Project."""
        return f'<Project {self.title}>'