# backend/routes/auth.py
from flask import Blueprint, request, jsonify
from db import get_conn
from utils.auth import decode_token
import jwt
import os
from datetime import datetime, timedelta, date

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
ALGORITHM = "HS256"
SQL_SELCECT_USER_BY_EMAIL = "SELECT * FROM Usuario WHERE email = %s"


def generate_token(user_row):
    dataNascimento = user_row.get("dataNascimento")
    hoje = date.today()
    if dataNascimento:
        idade = hoje.year - dataNascimento.year - (
            (hoje.month, hoje.day) < (dataNascimento.month, dataNascimento.day)
        )
    else:
        idade = None

    payload = {
        "sub": str(user_row["email"]),
        "nome": str(user_row["pNome"]),
        "peso": user_row.get("peso"),
        "altura": user_row.get("altura"),
        "percentual_gordura": user_row.get("percentual_gordura"),
        "idade": idade,
        "exp": datetime.utcnow() + timedelta(hours=8),
        "iat": datetime.utcnow(),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@auth_bp.post("/login")
def login():
    if not request.is_json:
        return jsonify({"code": "BAD_REQUEST", "message": "Corpoooo inválido"}), 400

    data = request.get_json()
    email = (data.get("email") or "").strip()
    senha = data.get("senha") or ""

    if not email or not senha:
        return jsonify({"code": "BAD_REQUEST", "message": "Usuário e senha obrigatórios"}), 400

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(SQL_SELCECT_USER_BY_EMAIL, (email,))
        user = cur.fetchone()
    finally:
        cur.close()
        conn.close()

    if not user or user["senha"] != senha:
        return jsonify({"code": "INVALID_CREDENTIALS", "message": "Usuário ou senha inválidos"}), 401

    token = generate_token(user)
    return jsonify({"token": token, "user": {"email": user["email"], "pNome": user["pNome"]}}), 200


@auth_bp.post("/register")
def register():
    if not request.is_json:
        return jsonify({"code": "BAD_REQUEST", "message": "Corpoooooooo inválido"}), 400

    data = request.get_json()
    email = (data.get("email") or "").strip()
    pNome = (data.get("pNome") or "").strip()
    senha = data.get("senha") or ""

    if not email or not pNome or not senha:
        return jsonify({"code": "BAD_REQUEST", "message": "Email, nome e senha são obrigatórios"}), 400

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute("SELECT 1 FROM Usuario WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"code": "EMAIL_EXISTS", "message": "Email já cadastrado"}), 409

        cur.execute(
            "INSERT INTO Usuario (email, pNome, senha) VALUES (%s, %s, %s)",
            (email, pNome, senha)
        )
        conn.commit()

        cur.execute(SQL_SELCECT_USER_BY_EMAIL, (email,))
        user = cur.fetchone()
    except Exception:
        conn.rollback()
        return jsonify({"code": "INTERNAL_ERROR", "message": "Erro ao registrar usuário"}), 500
    finally:
        cur.close()
        conn.close()

    token = generate_token(user)
    return jsonify({"token": token, "user": {"email": email, "pNome": pNome}}), 201

@auth_bp.get("/me")
def me():
    from utils.auth import get_auth_user_from_header
    user = get_auth_user_from_header()
    if not user:
        return jsonify({"code": "UNAUTHORIZED", "message": "Token inválido ou ausente"}), 401

    return jsonify({
        "email": user["email"],
        "pNome": user["pNome"]
    }), 200


@auth_bp.post("/update")
def update():
    if not request.is_json:
        return jsonify({"code": "BAD_REQUEST", "message": "Corpo inválido"}), 400

    data = request.get_json()
    nome = data.get("pNome")
    senha = data.get("senha")
    email = data.get("email")

    if not email:
        return jsonify({"code": "BAD_REQUEST", "message": "Usuário não logado"}), 401
    if not nome:
        return jsonify({"code": "BAD_REQUEST", "message": "Nome é obrigatório"}), 402

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    try:
        SQL = "UPDATE Usuario SET pNome=%s"
        params = [nome]

        if senha:
            SQL += ", senha=%s"
            params.append(senha)

        SQL += " WHERE email=%s"
        params.append(email)

        cur.execute(SQL, tuple(params))
        conn.commit()

        # RECUPERAR DADOS COMPLETOS DO USUÁRIO
        cur.execute(SQL_SELCECT_USER_BY_EMAIL, (email,))
        user = cur.fetchone()

    except:
        conn.rollback()
        return jsonify({"code": "INTERNAL_ERROR", "message": "Erro ao atualizar usuário"}), 500
    finally:
        cur.close()
        conn.close()

    # GERA TOKEN USANDO TODOS OS DADOS
    token = generate_token(user)

    return jsonify({
        "token": token,
        "user": {"email": user["email"], "pNome": user["pNome"]}
    }), 201
