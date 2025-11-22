# backend/utils/auth.py
from functools import wraps
from flask import request, jsonify, g
from db import get_conn
import jwt
import os
from datetime import datetime, date
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
ALGORITHM = "HS256"

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def get_auth_user_from_header():
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
            cur.execute("SELECT email, pNome FROM Usuario WHERE email = %s", (user_email,))
            user = cur.fetchone()
            cur.close()
            conn.close()
            return user
        except Exception:
            return None
    return None

def require_auth(fn):
    """
    Decorator para endpoints que exigem token.
    Coloca o usuário em flask.g.user (ou retorna 401).
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_auth_user_from_header()
        if not user:
            return jsonify({"code": "UNAUTHORIZED", "message": "Token inválido ou ausente"}), 401
        # coloca o usuário globalmente para ser usado na rota
        from flask import g
        g.user = user
        return fn(*args, **kwargs)
    return wrapper

def get_auth_user_from_header():
    auth_header = request.headers.get("Authorization", "")
    parts = auth_header.split()

    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        try:
            payload = decode_token(token)

            # Se houver email no payload, o usuário está autenticado
            if not payload.get("sub"):
                return None

            # Retorna todos os dados do token diretamente
            return {
                "email": payload.get("sub"),
                "pNome": payload.get("nome"),
                "peso": payload.get("peso"),
                "altura": payload.get("altura"),
                "percentual_gordura": payload.get("percentual_gordura"),
                "idade": payload.get("idade"),
            }

        except Exception:
            return None

    return None
