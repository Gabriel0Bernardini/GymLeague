from flask import Blueprint, jsonify, request
from db import get_conn

ranking_bp = Blueprint("ranking", __name__, url_prefix="/ranking")

lista_ranks = {"Plastico":0,"Cobre I":10, "Cobre II":20, "Cobre III":30, "Prata I":40, "Prata II":50, "Prata III":60,
              "Ouro I":70, "Ouro II":80, "Ouro III":90, "Platina I":100, "Platina II":110, "Platina III":120,
              "Diamante I":130, "Diamante II":140, "Diamante III":150, "Esmeralda I":160, "Esmeralda II":170, "Esmeralda III":180}

ranks_por_pontos = {v: k for k, v in lista_ranks.items()}

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
    finally:
        cursor.close()
        conn.close()

@ranking_bp.post("/todos")
def buscar_todos():
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
            SELECT 
                g.nome AS grupo,
                m.nome AS musculo,
                rm.ranking AS ranking_musculo,
                rg.ranking AS ranking_grupo
            FROM Musculo m
            JOIN GrupoMuscular g ON m.fk_nomeGrupoMuscular = g.nome
            LEFT JOIN RankingMusculo rm 
                ON rm.f_nomeMusculo = m.nome AND rm.f_emailUsuario = %s
            LEFT JOIN RankingGrupoMuscular rg
                ON rg.f_nomeGrupo = g.nome AND rg.f_emailUsuario = %s
            ORDER BY g.nome;
        """

        cursor.execute(SQL, (usuarioEmail, usuarioEmail))
        rows = cursor.fetchall()
        grupos = {}

        for row in rows:
            grupo = row["grupo"]
            if grupo not in grupos:
                grupos[grupo] = {
                    "rankingGrupo": row["ranking_grupo"] or "Plástico",
                    "musculos": []
                }
            grupos[grupo]["musculos"].append({
                "musculo": row["musculo"],
                "ranking": row["ranking_musculo"] or "Plástico"
            })
        return jsonify({"grupos": grupos}), 200
    
    except Exception as e:
        print("ERRO NO /ranking/todos:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

def calcular_ranking_usuario(performance: float, referencia: float) -> str:
    if referencia <= 0:
        return "Plastico"

    pct = performance / referencia
    pontos = int(pct * 180)

    if pontos < 0:
        pontos = 0
    if pontos > 180:
        pontos = 180

    pontos = round(pontos / 10) * 10

    return ranks_por_pontos.get(pontos, "Plastico")

def atualizar_ranking_musculo(conn, cursor, email, nome_exercicio, carga, repeticoes):
    performance = carga * repeticoes

    cursor.execute("""
        SELECT (carga * repeticoes) AS perf
        FROM Serie
        WHERE fEmail_UsuarioTreino = %s
        AND fk_nomeExercicio = %s
        ORDER BY fk_dataDoTreino DESC, numero DESC
        LIMIT 5
    """, (email, nome_exercicio))

    rows = cursor.fetchall()

    if not rows:
        referencia = 50
    else:
        referencia = sum(r["perf"] for r in rows) / len(rows)

    ranking_final = calcular_ranking_usuario(performance, referencia)

    cursor.execute("""
        SELECT fk_nomeMusculo
        FROM ExercicioMusculo
        WHERE fk_nomeExercicio = %s
    """, (nome_exercicio,))
    
    musculos = cursor.fetchall()

    for m in musculos:
        nome_musculo = m["fk_nomeMusculo"]

        cursor.execute("""
            INSERT INTO RankingMusculo (f_emailUsuario, f_nomeMusculo, ranking)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE ranking = VALUES(ranking)
        """, (email, nome_musculo, ranking_final))

    conn.commit()

    return ranking_final

def calcular_media_grupo(conn, cursor, email, nome_exercicio):
    cursor.execute("""
        SELECT fk_nomeMusculo
        FROM ExercicioMusculo
        WHERE fk_nomeExercicio = %s
    """, (nome_exercicio,))
    musculos_rows = cursor.fetchall()

    if not musculos_rows:
        return None

    grupos = set()

    for row in musculos_rows:
        cursor.execute("""
            SELECT fk_nomeGrupoMuscular
            FROM Musculo
            WHERE nome = %s
        """, (row["fk_nomeMusculo"],))
        grupo_row = cursor.fetchone()

        if grupo_row:
            grupos.add(grupo_row["fk_nomeGrupoMuscular"])

    resultados = {}
    for grupo in grupos:

        cursor.execute("""
            SELECT RM.ranking
            FROM RankingMusculo RM
            JOIN Musculo M ON RM.f_nomeMusculo = M.nome
            WHERE RM.f_emailUsuario = %s
            AND M.fk_nomeGrupoMuscular = %s
        """, (email, grupo))

        rows = cursor.fetchall()

        if not rows:
            media = 0
        else:
            pontos = [lista_ranks.get(r["ranking"], 0) for r in rows]
            media = sum(pontos) / len(pontos)

        media_arred = round(media / 10) * 10
        ranking_final = ranks_por_pontos.get(media_arred, "Plastico")

        cursor.execute("""
            INSERT INTO RankingGrupoMuscular (f_emailUsuario, f_nomeGrupo, ranking)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE ranking = VALUES(ranking)
        """, (email, grupo, ranking_final))

        resultados[grupo] = ranking_final

    conn.commit()

    return resultados

def atualizar_ranking_geral_usuario(conn, cursor, email):
    cursor.execute("""
        SELECT ranking
        FROM RankingGrupoMuscular
        WHERE f_emailUsuario = %s
    """, (email,))

    rows = cursor.fetchall()

    if not rows:
        ranking_final = "Plastico"
    else:
        pontos = [lista_ranks.get(r["ranking"], 0) for r in rows]
        media = sum(pontos) / len(pontos)
        media_arredondada = round(media / 10) * 10
        ranking_final = ranks_por_pontos.get(media_arredondada, "Plastico")

    cursor.execute("""
        UPDATE Usuario SET ranking_geral = %s
        WHERE email = %s
    """, (ranking_final, email))

    conn.commit()

    return ranking_final