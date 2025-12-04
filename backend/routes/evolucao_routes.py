from db import get_conn
from utils.auth import require_auth
from flask import Blueprint, jsonify, request, g

evolucao_bp = Blueprint("evolucao", __name__, url_prefix="/evolucao")

@evolucao_bp.get("/treinoCompletoData")
@require_auth
def get_treinoCompletoData():
    email = g.user['email']
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)   
    