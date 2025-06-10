from app import db

# Tabela associativa para relacionamento entre Freelancer e Skill
freelancer_skills = db.Table(
    'freelancer_skills',
    db.Column('freelancer_id', db.Integer, db.ForeignKey('freelancer.id', ondelete='CASCADE'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skill.id', ondelete='CASCADE'), primary_key=True)
)

# Tabela associativa para relacionamento entre Project e Skill
project_skills = db.Table(
    'project_skills',
    db.Column('project_id', db.Integer, db.ForeignKey('project.id', ondelete='CASCADE'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skill.id', ondelete='CASCADE'), primary_key=True)
)

class Skill(db.Model):
    """Modelo que representa uma habilidade técnica que pode ser associada a freelancers e projetos."""

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # Nome da habilidade (ex.: Python, React)

    # Relacionamentos (definidos via tabelas associativas)
    freelancers = db.relationship('Freelancer', secondary=freelancer_skills, backref=db.backref('skill_set', lazy=True))
    projects = db.relationship('Project', secondary=project_skills, backref=db.backref('required_skills', lazy=True))

    def to_dict(self):
        """Converte o modelo para um dicionário."""
        return {
            'id': self.id,
            'name': self.name
        }

    def __repr__(self):
        """Representação em string do modelo Skill."""
        return f'<Skill {self.name}>'