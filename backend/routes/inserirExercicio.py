from flask import Blueprint, jsonify
from db import get_conn

inserirExercicios_bp = Blueprint("inserirExercicios", __name__, url_prefix="/inserirExercicio")

@inserirExercicios_bp.get("/")
def buscarMusculos():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    
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