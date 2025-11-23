# backend/routes/rotina_routes.py
from flask import Blueprint, jsonify, request, g
from utils.auth import require_auth
from db import get_conn
from mysql.connector import IntegrityError

rotinas_bp = Blueprint("rotinas", __name__, url_prefix="/rotinas")

@rotinas_bp.get("/")
@require_auth
def listar_rotinas():
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

    resultados = []
    for i, r in enumerate(rotinas):
        resultados.append({"id": i + 1, "nome": r["nome"]})
    return jsonify(resultados), 200


@rotinas_bp.post("/")
@require_auth
def criar_rotina():
    """
    Espera payload:
    {
      "nome": "Programa X",
      "fichas": [
        { "nome": "Ficha A", "exercicios": [{ "nome": "Supino", "series": 4, "reps": 10, "descricao": "Banco" }, ...] },
        ...
      ]
    }
    """
    if not request.is_json:
        return jsonify({"code": "BAD_REQUEST", "message": "Corpo inválido"}), 400

    payload = request.get_json()
    nome_rotina = (payload.get("nome") or "").strip()
    fichas = payload.get("fichas") or []

    if not nome_rotina:
        return jsonify({"code": "BAD_REQUEST", "message": "Nome da rotina é obrigatório"}), 400

    criador = g.user["email"]

    conn = get_conn()
    cur = conn.cursor()

    try:
        # 1) Inserir Rotina (verifica se já existe)
        # Rotina tem PK (nome, fEmail_usuarioCriador)
        cur.execute("SELECT 1 FROM Rotina WHERE nome = %s AND fEmail_usuarioCriador = %s", (nome_rotina, criador))
        if cur.fetchone():
            return jsonify({"code": "ALREADY_EXISTS", "message": "Rotina com esse nome já existe para esse usuário"}), 409

        cur.execute("INSERT INTO Rotina (nome, fEmail_usuarioCriador, publico) VALUES (%s, %s, %s)",
                    (nome_rotina, criador, False))

        # 2) Para cada ficha: criar Treino (se necessário) e inserir TreinoRotina
        for ficha in fichas:
            nome_ficha = (ficha.get("nome") or "").strip()
            if not nome_ficha:
                raise ValueError("Cada ficha precisa ter um nome")

            # criar Treino (chave PK: nome, fEmail_usuarioCriador)
            cur.execute("SELECT 1 FROM Treino WHERE nome = %s AND fEmail_usuarioCriador = %s", (nome_ficha, criador))
            if not cur.fetchone():
                cur.execute("INSERT INTO Treino (nome, fEmail_usuarioCriador, publico) VALUES (%s, %s, %s)",
                            (nome_ficha, criador, False))

            # inserir ligação TreinoRotina
            cur.execute("""
                INSERT IGNORE INTO TreinoRotina (
                    fkEmail_CriadorTreino, fkNomeTreino, fkEmail_CriadorRotina, fkNomeRotina
                ) VALUES (%s, %s, %s, %s)
            """, (criador, nome_ficha, criador, nome_rotina))

            # 3) Para cada exercício da ficha: garantir Exercicio e inserir TreinoExercicio
            exercicios = ficha.get("exercicios") or []
            for ex in exercicios:
                nome_ex = (ex.get("nome") or "").strip()
                if not nome_ex:
                    raise ValueError("Exercício com nome inválido na ficha %s" % nome_ficha)

                # garantir existência do exercício no catálogo
                cur.execute("SELECT 1 FROM Exercicio WHERE nome = %s", (nome_ex,))
                if not cur.fetchone():
                    cur.execute("INSERT INTO Exercicio (nome) VALUES (%s)", (nome_ex,))

                num_series = ex.get("series") or ex.get("num_Series") or 1
                descricao = ex.get("descricao") or ""
                # Inserir TreinoExercicio (PK: fkNomeTreino, fkEmail_CriadorTreino, fkNomeExercicio)
                # Se já existir, faremos UPDATE simples (por segurança)
                cur.execute("""
                    INSERT INTO TreinoExercicio (num_Series, descricao, fkEmail_CriadorTreino, fkNomeTreino, fkNomeExercicio)
                    VALUES (%s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE num_Series = VALUES(num_Series), descricao = VALUES(descricao)
                """, (num_series, descricao, criador, nome_ficha, nome_ex))

        conn.commit()

    except ValueError as ve:
        conn.rollback()
        return jsonify({"code": "BAD_REQUEST", "message": str(ve)}), 400
    except IntegrityError as ie:
        conn.rollback()
        return jsonify({"code": "INTERNAL_ERROR", "message": "Erro de integridade: " + str(ie)}), 500
    except Exception as e:
        conn.rollback()
        return jsonify({"code": "INTERNAL_ERROR", "message": "Erro ao criar rotina", "detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Rotina criada"}), 201
