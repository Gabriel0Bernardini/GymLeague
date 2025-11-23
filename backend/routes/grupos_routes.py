# backend/routes/grupos_routes.py
from flask import Blueprint, jsonify
from db import get_conn

grupos_bp = Blueprint("grupos", __name__, url_prefix="/grupos-musculares")

@grupos_bp.get("/")
def listar_grupos():
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT nome FROM grupomuscular")
    grupos = [row[0] for row in cursor.fetchall()]

    return jsonify(grupos)
