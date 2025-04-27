"""Configurações da aplicação Flask, organizadas por ambiente."""

import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

class Config:
    """Configuração base para todos os ambientes."""
    # Chave secreta para sessões e segurança
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError('SECRET_KEY não está definido no .env')
    
    # Configuração do banco de dados SQLite
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False  
    
    # Configuração para JWT (autenticação com tokens)
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # Token expira em 1 hora
