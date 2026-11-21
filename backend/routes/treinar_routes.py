from flask import Blueprint, request, jsonify, g
from db import get_conn
from datetime import date
from utils.auth import require_auth
from routes.ranking import atualizar_ranking_musculo, calcular_media_grupo, atualizar_ranking_geral_usuario

treinar_bp = Blueprint("treinar", __name__, url_prefix="/treinar")


# ============================================================
# 1) OBTER TREINOS DE UMA ROTINA
# ============================================================
@treinar_bp.get("/rotina/<email_criador_rotina>/<nome_rotina>")
@require_auth
def get_treinos_da_rotina(email_criador_rotina, nome_rotina):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT 
                T.nome AS nome_treino,
                T.fEmail_usuarioCriador AS email_criador_treino
            FROM TreinoRotina TR
            JOIN Treino T
                ON TR.fkEmail_CriadorTreino = T.fEmail_usuarioCriador
            AND TR.fkNomeTreino = T.nome
            WHERE TR.fkEmail_CriadorRotina = %s
            AND TR.fkNomeRotina = %s;
        """

        cursor.execute(query, (email_criador_rotina, nome_rotina))
        data = cursor.fetchall()
        return jsonify(data), 200   
    except Exception as e:
        print("ERRO NO /treinar/rotina GET:", str(e))
        import traceback
        traceback.print_exc()
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


# ============================================================
# 2) INICIAR O TREINO DO DIA (UsuarioTreino)
# ============================================================
@treinar_bp.post("/iniciar")
@require_auth
def iniciar_treino():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    body = request.get_json()
    nome_treino = body["nome_treino"]
    email_criador_treino = body["email_criador_treino"]
    email_usuario = g.user["email"]
    hoje = date.today()
    try:
        # Verificar se já existe treino para hoje
        check_query = """
            SELECT *
            FROM UsuarioTreino
            WHERE fkNomeTreino = %s
            AND fkEmail_CriadorTreino = %s
            AND fEmail_UsuarioTreino = %s
            AND dataDoTreino = %s;
        """

        cursor.execute(check_query, (nome_treino, email_criador_treino, email_usuario, hoje))
        existente = cursor.fetchone()

        if existente:
            cursor.close()
            conn.close()
            return jsonify({"msg": "Treino já iniciado hoje.", "treino": existente}), 200

        # Criar novo registro
        insert_query = """
            INSERT INTO UsuarioTreino (dataDoTreino, fkEmail_CriadorTreino, fkNomeTreino, fEmail_UsuarioTreino)
            VALUES (%s, %s, %s, %s);
        """

        cursor.execute(insert_query, (hoje, email_criador_treino, nome_treino, email_usuario))
        conn.commit()
        return jsonify({"msg": "Treino iniciado com sucesso."}), 201
    except Exception as e:
        print("ERRO NO /treinar/iniciar POST:", str(e))
        import traceback
        traceback.print_exc()
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


# ============================================================
# 3) OBTER EXERCÍCIOS DO TREINO (TreinoExercicio)
# ============================================================
@treinar_bp.get("/exercicios/<email_criador_treino>/<nome_treino>")
@require_auth
def get_exercicios_do_treino(email_criador_treino, nome_treino):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT 
                TE.fkNomeExercicio AS nome_exercicio,
                TE.num_Series AS series_plano,
                TE.descricao
            FROM TreinoExercicio TE
            WHERE TE.fkEmail_CriadorTreino = %s
            AND TE.fkNomeTreino = %s;
        """

        cursor.execute(query, (email_criador_treino, nome_treino))
        data = cursor.fetchall()
        return jsonify(data), 200
    except Exception as e:
        print("ERRO NO /treinar/exercicios GET:", str(e))
        import traceback
        traceback.print_exc()
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
    


# ============================================================
# 4) OBTER SÉRIES FEITAS HOJE
# ============================================================
@treinar_bp.get("/series/<email_criador_treino>/<nome_treino>")
@require_auth
def get_series_do_dia(email_criador_treino, nome_treino):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    email_usuario = g.user["email"]
    hoje = date.today()
    try:
        query = """
            SELECT *
            FROM Serie
            WHERE fkNomeTreino = %s
            AND fkEmail_CriadorTreino = %s
            AND fEmail_UsuarioTreino = %s
            AND fk_dataDoTreino = %s;
        """

        cursor.execute(query, (nome_treino, email_criador_treino, email_usuario, hoje))
        data = cursor.fetchall()
    except Exception as e:
        print("ERRO NO /treinar/series GET:", str(e))
        import traceback
        traceback.print_exc()
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
    return jsonify(data), 200


# ============================================================
# 5) INSERIR SÉRIE
# ============================================================
@treinar_bp.post("/serie")
@require_auth
def inserir_serie():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    body = request.get_json()
    email_usuario = g.user["email"]
    hoje = date.today()

    try:
        insert_query = """
            INSERT INTO Serie 
            (numero, detalhe, repeticoes, carga,
            fk_nomeExercicio, fkNomeTreino, fkEmail_CriadorTreino,
            fEmail_UsuarioTreino, fk_dataDoTreino)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """

        cursor.execute(insert_query, (
            body["numero"],
            body.get("detalhe"),
            body["repeticoes"],
            body["carga"],
            body["nome_exercicio"],
            body["nome_treino"],
            body["email_criador_treino"],
            email_usuario,
            hoje
        ))


        atualizar_ranking_musculo(conn, cursor, email_usuario, body["nome_exercicio"], body["carga"], body["repeticoes"])
        calcular_media_grupo(conn, cursor, email_usuario, body["nome_exercicio"])
        atualizar_ranking_geral_usuario(conn, cursor, email_usuario)
        conn.commit()
        return jsonify({"msg": "Série adicionada com sucesso!"}), 201
    except Exception as e:
        print("ERRO NO /treinar/serie POST:", str(e))
        import traceback
        traceback.print_exc()
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

   


# ============================================================
# 6) ATUALIZAR SÉRIE
# ============================================================
@treinar_bp.put("/serie")
@require_auth
def atualizar_serie():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    body = request.get_json()
    email_usuario = g.user["email"]
    hoje = date.today()
    try:
        update_query = """
            UPDATE Serie
            SET detalhe = %s,
                repeticoes = %s,
                carga = %s
            WHERE numero = %s
            AND fk_nomeExercicio = %s
            AND fkNomeTreino = %s
            AND fkEmail_CriadorTreino = %s
            AND fEmail_UsuarioTreino = %s
            AND fk_dataDoTreino = %s;
        """

        cursor.execute(update_query, (
            body.get("detalhe"),
            body["repeticoes"],
            body["carga"],
            body["numero"],
            body["nome_exercicio"],
            body["nome_treino"],
            body["email_criador_treino"],
            email_usuario,
            hoje
        ))

        conn.commit()
        return jsonify({"msg": "Série atualizada!"}), 200
    except Exception as e:
        print("ERRO NO /treinar/serie PUT:", str(e))
        import traceback
        traceback.print_exc()
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
    


# ============================================================
# 7) DELETAR SÉRIE
# ============================================================
@treinar_bp.delete("/serie")
@require_auth
def deletar_serie():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    body = request.get_json()
    email_usuario = g.user["email"]
    hoje = date.today()
    try:
        delete_query = """
            DELETE FROM Serie
            WHERE numero = %s
            AND fk_nomeExercicio = %s
            AND fkNomeTreino = %s
            AND fkEmail_CriadorTreino = %s
            AND fEmail_UsuarioTreino = %s
            AND fk_dataDoTreino = %s;
        """

        cursor.execute(delete_query, (
            body["numero"],
            body["nome_exercicio"],
            body["nome_treino"],
            body["email_criador_treino"],
            email_usuario,
            hoje
        ))

        conn.commit()
        return jsonify({"msg": "Série removida!"}), 200
    except Exception as e:
        print("ERRO NO /treinar/serie DELETE:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
