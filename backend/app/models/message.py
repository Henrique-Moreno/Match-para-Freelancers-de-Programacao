from app import db
from datetime import datetime

class Message(db.Model):
    """Modelo que representa uma mensagem enviada entre usuários em um projeto."""

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id', ondelete='CASCADE'), nullable=False)  # Chave estrangeira para o projeto
    sender_id = db.Column(db.Integer, nullable=False)  # ID do remetente (pode ser Client ou Freelancer)
    sender_role = db.Column(db.String(20), nullable=False)  # Papel do remetente ('client' ou 'freelancer')
    receiver_id = db.Column(db.Integer, nullable=False)  # ID do destinatário (pode ser Client ou Freelancer)
    receiver_role = db.Column(db.String(20), nullable=False)  # Papel do destinatário ('client' ou 'freelancer')
    content = db.Column(db.Text, nullable=False)  # Conteúdo da mensagem
    created_at = db.Column(db.DateTime, default=datetime.today, nullable=False)

    # Relacionamento com Project
    project = db.relationship('Project', backref=db.backref('messages', lazy=True, cascade='all, delete'))

    def to_dict(self):
        """Converte o modelo para um dicionário."""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'sender_id': self.sender_id,
            'sender_role': self.sender_role,
            'receiver_id': self.receiver_id,
            'receiver_role': self.receiver_role,
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        """Representação em string do modelo Message."""
        return f'<Message {self.id} for Project {self.project_id}>'