from flask import Blueprint, jsonify, request
from db import get_conn

ranking_bp = Blueprint("ranking", __name__, url_prefix="/ranking")

lista_ranks = {"Plastico":0,"Cobre I":10, "Cobre II":20, "Cobre III":30, "Prata I":40, "Prata II":50, "Prata III":60,
              "Ouro I":70, "Ouro II":80, "Ouro III":90, "Platina I":100, "Platina II":110, "Platina III":120,
              "Diamante I":130, "Diamante II":140, "Diamante III":150, "Esmeralda I":160, "Esmeralda II":170, "Esmeralda III":180}

@ranking_bp.post("/top3")
def buscar_top3():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    dados = request.get_json()
    if dados is None:
        return jsonify({"erro": "Body JSON ausente"}), 400
    usuarioEmail = dados.get("usuarioEmail")
    if not usuarioEmail:
        return jsonify({"erro": "usuarioEmail ausente"}), 400


    try:
        SQL = """
            SELECT ranking, f_nomeMusculo as musculo 
            FROM RankingMusculo 
            WHERE f_emailUsuario = %s
            """
        cursor.execute(SQL, (usuarioEmail,))
        rows = cursor.fetchall()

        resultados = []
        for row in rows:
            musculo = row["musculo"]
            rank = row["ranking"]
            pontuacao = lista_ranks.get(rank, -1)
            resultados.append({
                "musculo": musculo,
                "ranking": rank,
                "pontuacao": pontuacao
            })
        top3 = sorted(resultados, key=lambda x: x["pontuacao"], reverse=True)[:3]
        return jsonify(top3), 200
    except Exception as e:
        print("ERRO NO /ranking/top3:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
    

