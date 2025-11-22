# backend/routes/users.py
from flask import Blueprint, request, jsonify, g
from db import get_conn
from utils.auth import require_auth

users_bp = Blueprint("users", __name__, url_prefix="/users")

@users_bp.get("/")
def list_users():
    """Lista usuários (somente email e pNome) — para testes."""
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT email, pNome FROM Usuario")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows), 200

@users_bp.get("/<email>")
def get_user(email):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT email, pNome, dataNascimento, peso, altura, percentual_gordura, f_nomeRotinaUsando, fEmail_criadorRotina FROM Usuario WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    if not user:
        return jsonify({"code": "NOT_FOUND", "message": "Usuário não encontrado"}), 404
    return jsonify(user), 200

@users_bp.post("/")
def create_user():
    """Cria usuário (sem validação complexa, apenas para começar)."""
    if not request.is_json:
        return jsonify({"code": "BAD_REQUEST", "message": "Corpo inválido"}), 400
    data = request.get_json()
    email = (data.get("email") or "").strip()
    pNome = (data.get("pNome") or "").strip()
    senha = data.get("senha") or ""
    if not email or not pNome or not senha:
        return jsonify({"code": "BAD_REQUEST", "message": "email, pNome e senha obrigatórios"}), 400

    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT 1 FROM Usuario WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"code": "EMAIL_ALREADY_EXISTS", "message": "Email já cadastrado"}), 409
        cur.execute("INSERT INTO Usuario (email, pNome, senha) VALUES (%s, %s, %s)", (email, pNome, senha))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"code": "INTERNAL_ERROR", "message": "Erro ao criar usuário", "detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()
    return jsonify({"email": email, "pNome": pNome}), 201

@users_bp.put("/me")
@require_auth
def update_me():
    """Atualiza dados do usuário autenticado (pNome, peso, altura, dataNascimento, percentual_gordura)."""
    from flask import g
    if not request.is_json:
        return jsonify({"code": "BAD_REQUEST", "message": "Corpo inválido"}), 400
    data = request.get_json()
    pNome = data.get("pNome")
    peso = data.get("peso")
    altura = data.get("altura")
    percentual = data.get("percentual_gordura")
    dataNascimento = data.get("dataNascimento")  # espere YYYY-MM-DD ou null

    # montar UPDATE dinamicamente
    set_clauses = []
    params = []
    if pNome is not None:
        set_clauses.append("pNome=%s"); params.append(pNome)
    if peso is not None:
        set_clauses.append("peso=%s"); params.append(peso)
    if altura is not None:
        set_clauses.append("altura=%s"); params.append(altura)
    if percentual is not None:
        set_clauses.append("percentual_gordura=%s"); params.append(percentual)
    if dataNascimento is not None:
        set_clauses.append("dataNascimento=%s"); params.append(dataNascimento)
    if not set_clauses:
        return jsonify({"code": "BAD_REQUEST", "message": "Nada para atualizar"}), 400

    params.append(g.user["email"])
    SQL = "UPDATE Usuario SET " + ", ".join(set_clauses) + " WHERE email = %s"

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(SQL, tuple(params))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"code": "INTERNAL_ERROR", "message": "Erro ao atualizar", "detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()
    return jsonify({"message": "Atualizado"}), 200

@users_bp.delete("/me")
@require_auth
def delete_me():
    from flask import g
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM Usuario WHERE email = %s", (g.user["email"],))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"code": "INTERNAL_ERROR", "message": "Erro ao deletar", "detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()
    return jsonify({"message": "Deletado"}), 200
