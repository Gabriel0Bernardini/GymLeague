from flask import Blueprint, jsonify, request
from db import get_conn
import mysql.connector

inserirExercicios_bp = Blueprint("inserirExercicios", __name__, url_prefix="/inserirExercicio")

@inserirExercicios_bp.get("/")
def buscar_musculos():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    
    try:
        SQL = """
            SELECT
            m.nome as nomeMusculo,
            g.nome as nomeGrupoMuscular
            FROM Musculo m JOIN GrupoMuscular g ON m.fk_nomeGrupoMuscular = g.nome"""
        
        cursor.execute(SQL)
        
        result = cursor.fetchall()
        
        gruposMusculares = {}
        musculos = []

        for row in result:
            grupo = row["nomeGrupoMuscular"]
            musculo = row["nomeMusculo"]

            if grupo not in gruposMusculares:
                gruposMusculares[grupo] = {"nomeGrupo": grupo}

            musculos.append({
                "nome": musculo,
                "grupoMuscular": {"nomeGrupo": grupo}
            })

        return jsonify({
            "gruposMusculares": list(gruposMusculares.values()),
            "musculos": musculos
        })
    finally:
        cursor.close()
        conn.close()
    
@inserirExercicios_bp.post("/")
def insert_exercicio():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    
    try:
        data = request.get_json()

        nome = data.get("nome")
        musculos = data.get("musculos", [])
        
        if not nome or not nome.strip():
            return jsonify({
                "message": "O nome do exercício é obrigatório.",
                "code": "NAME_REQUIRED"
            }), 400

        if not musculos:
            return jsonify({
                "message": "Selecione ao menos um músculo.",
                "code": "MUSCLES_REQUIRED"
            }), 400
            
        cursor.execute("SELECT nome FROM Exercicio WHERE nome = %s", (nome,))
        existe = cursor.fetchone()

        if existe:
            return jsonify({
                "message": "Esse exercício já existe.",
                "code": "EXERCISE_ALREADY_EXISTS"
            }), 409
        
        cursor.execute(
            "INSERT INTO Exercicio (nome) VALUES (%s)",
            (nome,)
        )
        
        for m in musculos:
            cursor.execute(
                "INSERT INTO ExercicioMusculo (fk_nomeExercicio, fk_nomeMusculo) VALUES (%s, %s)",
                (nome, m)
            )

        conn.commit()
        
        return jsonify({
            "message": "Exercício criado com sucesso.",
            "nome": nome,
            "musculos": musculos
        }), 201
        
    except mysql.connector.Error as db_err:
        conn.rollback()
        print("DB ERROR:", db_err)
        return jsonify({"message": "Erro interno no BD"}), 500

    except Exception as err:
        conn.rollback()
        print("SERVER ERROR:", err)
        return jsonify({"message": "Erro no servidor"}), 500

    finally:
        cursor.close()
        conn.close()
