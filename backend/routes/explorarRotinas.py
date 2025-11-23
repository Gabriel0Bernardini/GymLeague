from flask import Blueprint, jsonify
from db import get_conn

explorarRotinas_bp = Blueprint("explorarRotinas", __name__, url_prefix="/explorarRotinas")

@explorarRotinas_bp.get("/")
def buscarRotinas_publicas():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    SQL = """
        SELECT
        r.nome AS nomeRotina,
        r.fEmail_usuarioCriador AS criadorEmail,
        u.pNome AS criadorNome,
        t.nome AS nomeTreino,
        t.fEmail_usuarioCriador AS treinoCriadorEmail,
        e.nome AS nomeExercicio,
        te.numSerie AS numSerie,
        te.descricao AS descricao

        
        
        FROM Rotina r JOIN Usuario u ON r.fEmail_usuarioCriador = u.email
        JOIN TreinoRotina tr ON r.nome = tr.fk_nomeRotina AND 
            r.fEmail_usuarioCriador = tr.fk_fEmail_usuarioCriador
        JOIN Treino t ON t.nome = tr.fk_nomeTreino AND
            t.fEmail_usuarioCriador = tr.fk_fEmail_usuarioCriador
        LEFT JOIN TreinoExercicio te
        ON te.fkNomeTreino = t.nome
        AND te.fkEmail_CriadorTreino = t.fEmail_usuarioCriador
        LEFT JOIN Exercicio e ON e.nome = te.fkNomeExercicio
         
        WHERE r.publico = TRUE
         ORDER BY r.nome, t.nome; """
    
    cursor.execute(SQL)
    rows = cursor.fetchall()

    rotinas = {}
    for row in rows:
        nomeRotina = row["nomeRotina"]
        emailRotina = row["criadorEmail"]
        chaveRotina = (nomeRotina, emailRotina)
        if chaveRotina not in rotinas:
            rotinas[chaveRotina] = {
                "nome": nomeRotina,
                "criadorEmail": emailRotina,
                "criadorNome": row["criadorNome"],
                "treinos": {}
            }
        treinoNome = row["nomeTreino"]
        if treinoNome not in rotinas[chaveRotina]["treinos"]:
            rotinas[chaveRotina]["treinos"][treinoNome] = {
                "nome": treinoNome,
                "exercicios": []
            }
        
        if row["nomeExercicio"]:
            rotinas[chaveRotina]["treinos"][treinoNome]["exercicios"].append({
                "nome": row["nomeExercicio"],
                "series": row["numSerie"],
                "descricao": row["descricao"]
            })
    
    rotinasFinais = []
    for(_,_), dadosRotinas in rotinas.items():
        dadosRotinas["treinos"] = list(dadosRotinas["treinos"].values())
        rotinasFinais.append(dadosRotinas)
    
    return jsonify({"rotinas": rotinasFinais})