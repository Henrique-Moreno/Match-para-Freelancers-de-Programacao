from flask import Blueprint
from app.controllers.proposal_controller import ProposalController

# Cria um Blueprint para rotas relacionadas a propostas
proposal_bp = Blueprint('proposal', __name__)

@proposal_bp.route('/create', methods=['POST'])
def create():
    """Rota para criar uma nova proposta para um projeto."""
    return ProposalController.create()

@proposal_bp.route('/all/<int:project_id>', methods=['GET'])
def get_all(project_id):
    """Rota para listar todas as propostas de um projeto."""
    return ProposalController.get_all(project_id)

@proposal_bp.route('/<int:proposal_id>', methods=['GET'])
def get(proposal_id):
    """Rota para obter os detalhes de uma proposta específica."""
    return ProposalController.get(proposal_id)

@proposal_bp.route('/<int:proposal_id>', methods=['PUT'])
def update(proposal_id):
    """Rota para atualizar o status de uma proposta."""
    return ProposalController.update(proposal_id)

@proposal_bp.route('/<int:proposal_id>', methods=['DELETE'])
def delete(proposal_id):
    """Rota para deletar uma proposta."""
    return ProposalController.delete(proposal_id)

@proposal_bp.route('/freelancer/proposals', methods=['GET'])
def get_freelancer_proposals():
    """Rota para listar todas as propostas do freelancer autenticado."""
    return ProposalController.get_freelancer_proposals()

@proposal_bp.route('/<int:proposal_id>/complete', methods=['PATCH'])
def complete(proposal_id):
    """Rota para marcar uma proposta como concluída pelo freelancer."""
    return ProposalController.complete(proposal_id)