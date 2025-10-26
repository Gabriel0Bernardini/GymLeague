import os
from datetime import datetime, timedelta

from flask import Flask, jsonify, request
from flask_cors import CORS
import jwt
from dotenv import load_dotenv

from db import get_conn

# --- Config ---
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
ALGORITHM = "HS256"
FRONT_ORIGIN = os.getenv("FRONT_ORIGIN", "http://localhost:5173")

app = Flask(__name__)
CORS(app, origins=[FRONT_ORIGIN])

# --- Helpers JWT ---
def generate_token(user_row):
    """
    Gera um JWT contendo:
      - sub (email do usuário)
      - nome do usuario
      - exp (expira em 8h)
      - iat (emitido agora)
    """
    payload = {
        "sub": str(user_row["email"]),
        "nome": str(user_row["pNome"]),
        "exp": datetime.utcnow() + timedelta(hours=8),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    """Decodifica e valida o JWT usando SECRET_KEY e algoritmo HS256."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def get_auth_user_from_header():
    """
    Lê o header Authorization: Bearer <token>,
    valida o token e retorna o usuário (id, username, name) do banco.
    """
    auth_header = request.headers.get("Authorization", "")
    parts = auth_header.split()

    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        try:
            payload = decode_token(token)
            user_email = payload.get("sub")
            if not user_email:
                return None

            conn = get_conn()
            cur = conn.cursor(dictionary=True)
            cur.execute(
                "SELECT email, pNome FROM Usuario WHERE email = %s",
                (user_email,)
            )
            user = cur.fetchone()
            cur.close()
            conn.close()

            return user
        except Exception:
            # Pode ser token expirado/inválido ou erro de banco
            return None

    return None

# --- Rotas ---
@app.get("/health")
def health():
    """Saúde do servidor (para teste rápido)."""
    return jsonify({"status": "ok"}), 200

@app.post("/auth/login")
def login():
    """
    Espera JSON:
      { "username": "aluno", "password": "123456" }

    Respostas:
      200: { "token": "...", "user": { email, pNome } }
      400: { "code": "BAD_REQUEST", "message": "Corpo inválido" }
      401: { "code": "INVALID_CREDENTIALS", "message": "Usuário ou senha inválidos" }
    """
    if not request.is_json:
        return jsonify({"code": "BAD_REQUEST", "message": "Corpo inválido"}), 400

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    senha = data.get("senha") or ""

    if not email or not senha:
        return jsonify({"code": "BAD_REQUEST", "message": "Usuário e senha obrigatórios"}), 400

    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT * FROM Usuario WHERE email = %s",
        (email,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    # Sem hash: comparação direta (apenas para testes)
    if not user or user["senha"] != senha:
        return jsonify({"code": "INVALID_CREDENTIALS", "message": "Usuário ou senha inválidos"}), 401

    token = generate_token(user)

    return jsonify({
        "token": token,
        "user": {
            "email": user["email"],
            "pNome": user["pNome"],
        }
    }), 200

@app.get("/auth/me")
def me():
    """
    Necessita do header: Authorization: Bearer <token>
    Respostas:
      200: { email, pNome }
      401: { code: "UNAUTHORIZED", message: "Token inválido ou ausente" }
    """
    user = get_auth_user_from_header()
    if not user:
        return jsonify({"code": "UNAUTHORIZED", "message": "Token inválido ou ausente"}), 401

    return jsonify({
        "email": user["email"],
        "pNome": user["pNome"],
    }), 200

# --- Execução ---
if __name__ == "__main__":
    port = int(os.getenv("FLASK_RUN_PORT", 5000))
    debug = bool(int(os.getenv("FLASK_DEBUG", "1")))
    app.run(host="0.0.0.0", port=port, debug=debug)
