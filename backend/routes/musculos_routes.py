# backend/routes/musculos_routes.py
from flask import Blueprint, jsonify
from db import get_conn

musculos_bp = Blueprint("musculos", __name__, url_prefix="/musculos")

@musculos_bp.get("/<grupo>")
def listar_por_grupo(grupo):
    conn = get_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT nome
            FROM Musculo
            WHERE fk_nomeGrupoMuscular = %s
        """, (grupo,))

        musculos = [row[0] for row in cursor.fetchall()]
        return jsonify(musculos)
    finally:
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
