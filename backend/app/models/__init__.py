from app import db

from app.models.client import Client

from app.models.freelancer import Freelancer

from app.models.project import Project

from app.models.proposal import Proposal

from app.models.admin import Admin

from app.models.review import Review

from app.models.message import Message

from app.models.skill import Skill, freelancer_skills, project_skills

__all__ = [db, Client, Freelancer, Project, Proposal, Admin, Review, Message, Skill, freelancer_skills, project_skills]