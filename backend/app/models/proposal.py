from app import db
from datetime import datetime

class Proposal(db.Model):
    """Modelo que representa uma proposta enviada por um freelancer para um projeto."""

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id', ondelete='CASCADE'), nullable=False)  # Chave estrangeira para o projeto
    freelancer_id = db.Column(db.Integer, db.ForeignKey('freelancer.id', ondelete='CASCADE'), nullable=False)  # Chave estrangeira para o freelancer
    bid_amount = db.Column(db.Float, nullable=False)  
    estimated_days = db.Column(db.Integer, nullable=False)  
    message = db.Column(db.Text)  
    status = db.Column(db.String(20), default='pending', nullable=False)  # Status: pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.today, nullable=False)  

    # Relacionamentos com as models Project e Freelancer
    project = db.relationship('Project', backref=db.backref('proposals', lazy=True, cascade='all, delete'))
    freelancer = db.relationship('Freelancer', backref=db.backref('proposals', lazy=True, cascade='all, delete'))

    def to_dict(self):
        """Converte o modelo para um dicionário."""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'freelancer_id': self.freelancer_id,
            'bid_amount': self.bid_amount,
            'estimated_days': self.estimated_days,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        """Representação em string do modelo Proposal."""
        return f'<Proposal {self.id} for Project {self.project_id}>'