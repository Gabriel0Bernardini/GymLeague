# backend/routes/exercicios_routes.py
from flask import Blueprint, jsonify
from db import get_conn

exercicios_bp = Blueprint("exercicios", __name__, url_prefix="/exercicios")

@exercicios_bp.get("/")
def listar_exercicios():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            e.nome AS exercicio,
            gm.nome AS grupo,
            m.nome AS musculo
        FROM Exercicio e
        JOIN ExercicioMusculo em ON em.fk_nomeExercicio = e.nome
        JOIN Musculo m ON m.nome = em.fk_nomeMusculo
        JOIN GrupoMuscular gm ON gm.nome = m.fk_nomeGrupoMuscular
    """)

    rows = cursor.fetchall()

    exercicios = {}
    for row in rows:
        nome = row["exercicio"]
        if nome not in exercicios:
            exercicios[nome] = {
                "nome": nome,
                "musculos": [],
                "grupoMuscular": row["grupo"]
            }
        exercicios[nome]["musculos"].append(row["musculo"])

    return jsonify(list(exercicios.values()))
