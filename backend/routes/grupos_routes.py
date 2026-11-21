# backend/routes/grupos_routes.py
from flask import Blueprint, jsonify
from db import get_conn

grupos_bp = Blueprint("grupos", __name__, url_prefix="/grupos-musculares")

@grupos_bp.get("/")
def listar_grupos():
    conn = get_conn()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT nome FROM GrupoMuscular")
        grupos = [row[0] for row in cursor.fetchall()]
        return jsonify(grupos), 200
    except Exception as e:
        print("ERRO NO /grupos-musculares GET:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
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
