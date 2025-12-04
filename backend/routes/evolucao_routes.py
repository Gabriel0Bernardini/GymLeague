from db import get_conn
from flask import Blueprint, jsonify

evolucao_bp = Blueprint("evolucao", __name__, url_prefix="/evolucao")

@evolucao_bp.get("/")
def get_treinoCompleto