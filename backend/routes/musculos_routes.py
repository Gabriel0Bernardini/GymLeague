# backend/routes/musculos_routes.py
from flask import Blueprint, jsonify
from db import get_conn

musculos_bp = Blueprint("musculos", __name__, url_prefix="/musculos")

@musculos_bp.get("/<grupo>")
def listar_por_grupo(grupo):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT nome
        FROM Musculo
        WHERE fk_nomeGrupoMuscular = %s
    """, (grupo,))

    musculos = [row[0] for row in cursor.fetchall()]
    return jsonify(musculos)
