from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class Client(db.Model):
    """Modelo que representa um cliente no sistema de Match para Freelancers."""

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    company = db.Column(db.String(100))  
    phone = db.Column(db.String(15))  
    role = db.Column(db.String(20), default='client', nullable=False)  
    created_at = db.Column(db.DateTime, default=datetime.today, nullable=False)

    def set_password(self, password):
        """Gera o hash da senha e armazena."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifica se a senha fornecida corresponde ao hash armazenado."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Converte o modelo para um dicionário."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'company': self.company,
            'phone': self.phone,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        """Representação em string do modelo Client."""
        return f'<Client {self.name}>'