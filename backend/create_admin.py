from app import db, create_app
from app.models.admin import Admin
from datetime import datetime

def create_initial_admin():
    """Cria um administrador inicial no banco de dados."""
    app = create_app()
    with app.app_context():
        if Admin.query.filter_by(email="admin@exemplo.com").first():
            print("Administrador já existe com o email admin@exemplo.com.")
            return

        # Cria um novo administrador
        admin = Admin(
            name="Administrador Inicial",
            email="admin@exemplo.com",
            created_at=datetime.today()
        )
        admin.set_password("senhasegura123")  # Define a senha com hash seguro

        try:
            db.session.add(admin)
            db.session.commit()
            print("Administrador criado com sucesso!")
            print("Email: admin@exemplo.com")
            print("Senha: senhasegura123")
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao criar administrador: {str(e)}")

if __name__ == "__main__":
    create_initial_admin()

# python create_admin.py