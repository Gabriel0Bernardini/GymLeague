from db import get_conn
from utils.auth import require_auth
from flask import Blueprint, jsonify, request, g
import mysql.connector

home_bp = Blueprint('home_routes', __name__)

home_bp.get("/peso_percentual")
require_auth
def get_peso_percentual():
    conn = None
    cursor = None
    email = g.user['email']
    
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        
        SQL = """
            SELECT peso, percentual_gordura
            FROM Usuario
            WHERE email = %s
            """
        cursor.execute(SQL, (email,))
        result = cursor.fetchone()
        if result["peso"] is None or result["percentual_gordura"] is None:
            return jsonify({"error": "Peso ou percentual de gordura não cadastrado."}), 404
        return jsonify(result), 200
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Erro ao buscar dados de peso e percentual de gordura."}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
    

home_bp.get("/ranking")
require_auth
def get_ranking():
    #FAZER DEPOIS POIS NAO ESTAMOS CADASTRANDO RANKING GERAL AINDA          
    return jsonify({"message": "Rota de ranking em construção."}), 200 

home_bp.get("/metas")
require_auth
def get_metas():
    conn = None
    cursor = None
    email = g.user['email']
    
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        
        SQL = """
            SELECT titulo,objetivo,tipo
            FROM Metas
            WHERE fk_emailUsuario = %s
            """
        cursor.execute(SQL, (email,))
        result = cursor.fetchone()
        if result["meta_peso"] is None or result["meta_percentual_gordura"] is None:
            return jsonify({"error": "Metas de peso ou percentual de gordura não cadastradas."}), 404
        return jsonify(result), 200
    
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Erro ao buscar metas de peso e percentual de gordura."}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()