from flask import Blueprint, jsonify, g
from utils.auth import require_auth
from db import get_conn

rotinas_bp = Blueprint("rotinas", __name__, url_prefix="/rotinas")

@rotinas_bp.get("/")
@require_auth
def listar_rotinas():
    """
    Lista os rotinas (fichas) criados pelo usuário autenticado.
    """
    email = g.user["email"]

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT nome 
        FROM Rotina
        WHERE fEmail_usuarioCriador = %s
    """, (email,))

    rotinas = cur.fetchall()

    cur.close()
    conn.close()

    # criar ID artificial
    resultados = []
    for i, r in enumerate(rotinas):
        resultados.append({
            "id": i + 1,
            "nome": r["nome"]
        })

    return jsonify(resultados)
