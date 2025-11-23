from flask import Blueprint, jsonify, request
from db import get_conn

explorarRotinas_bp = Blueprint("explorar-rotinas", __name__, url_prefix="/explorar-rotinas")

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
        te.num_Series AS numSerie,
        te.descricao AS descricao

        
        
        FROM Rotina r JOIN Usuario u ON r.fEmail_usuarioCriador = u.email
        JOIN TreinoRotina tr ON r.nome = tr.fkNomeRotina AND 
            r.fEmail_usuarioCriador = tr.fkEmail_CriadorRotina
        JOIN Treino t ON t.nome = tr.fkNomeTreino AND
            t.fEmail_usuarioCriador = tr.fkEmail_CriadorTreino
        LEFT JOIN TreinoExercicio te
        ON te.fkNomeTreino = t.nome
        AND te.fkEmail_CriadorTreino = t.fEmail_usuarioCriador
        LEFT JOIN Exercicio e ON e.nome = te.fkNomeExercicio
         
        WHERE r.publico = true
         ORDER BY r.nome; """
    
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

@explorarRotinas_bp.post("/copiar")
def copiarRotina_publica():
    dados = request.get_json()
    rotina = dados.get("rotina")
    usuarioEmail = dados.get("usuarioEmail")

    if not rotina or not usuarioEmail:
        return jsonify({"erro": "Dados incompletos"}), 400
    conn = get_conn()
    cursor = conn.cursor()
    nomeRotina = rotina["nome"]
    SQL = """
        INSERT INTO Rotina (nome, fEmail_usuarioCriador, publico)
        VALUES (%s, %s, false);
    """
    cursor.execute(SQL, (nomeRotina, usuarioEmail))

    for treino in rotina["treinos"]:
        SQL_TREINO = """
            INSERT INTO Treino(nome, fEmail_usuarioCriador)
            VALUES (%s, %s)"""
        cursor.execute(SQL_TREINO, (treino["nome"], usuarioEmail))

        SQL_TREINO_ROTINA = """
            INSERT INTO TreinoRotina(fkNomeRotina, fkEmail_CriadorRotina,
            fkNomeTreino, fkEmail_CriadorTreino)
            VALUES (%s, %s, %s, %s)"""
        cursor.execute(SQL_TREINO_ROTINA, (nomeRotina, usuarioEmail, treino["nome"], usuarioEmail))

        for exercicio in treino["exercicios"]:
            SQL_ET = """
                INSERT INTO TreinoExercicio(fkNomeTreino, fkEmail_CriadorTreino,
                fkNomeExercicio, num_Series, descricao)
                VALUES (%s, %s, %s, %s, %s)"""
            cursor.execute(SQL_ET, (treino["nome"], usuarioEmail, exercicio["nome"], exercicio["series"], exercicio["descricao"]))
    
    conn.commit()
    return jsonify({"mensagem": "Rotina copiada com sucesso!"})