from db import get_conn
from utils.auth import require_auth
from flask import Blueprint, jsonify, request, g

evolucao_bp = Blueprint("evolucao", __name__, url_prefix="/evolucao")

@evolucao_bp.get("/treinoCompletoData")
@require_auth
def get_treinoCompletoData():
    email = g.user['email']
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)   
    resposta = []
    
    SQL = """
        SELECT fknomeTreino, dataDoTreino
        FROM usuariotreino
        WHERE fEmail_UsuarioTreino = %s 
        AND dataDoTreino <> '9999-12-31'
    """
    cursor.execute(SQL, (email,))
    treinosData = cursor.fetchall()
    
    for treino in treinosData:
        
        nomeTreino = treino['fknomeTreino']
        dataDoTreino = treino['dataDoTreino']
        
        SQL = """
            SELECT fkNomeRotina 
            FROM treinoRotina
            WHERE fkEmail_CriadorTreino = %s
            AND fkEmail_CriadorRotina = %s
            AND fkNomeTreino = %s
            """
        cursor.execute(SQL, (email, email, nomeTreino))
        rotina = cursor.fetchall()
        
        nomeRotina = rotina["fkNomeRotina"] if rotina else None
        
        SQL = """
            SELECT num_Series, descricao, fkNomeExercicio
            FROM treinoExercicio
            WHERE fkEmail_CriadorTreino = %s
            AND fkNomeTreino = %s           
        """
        
        cursor.execute(SQL, (email, nomeTreino))
        exercicios = cursor.fetchall()
        
        lista_exercicios = []
        
        for exercicio in exercicios:
            nomeExercicio = exercicio['fkNomeExercicio']
            numeroSeries = exercicio['num_Series']
            
            SQL = """
                SELECT numero, detalhe, repeticoes, carga
                FROM serie
                WHERE fEmail_UsuarioTreino = %s
                AND fkEmail_CriadorTreino = %s
                AND fk_nomeExercicio = %s
                AND fkNomeTreino = %s
                AND fk_dataDoTreino = %s                
            """        
            cursor.execute(SQL, (email, email, nomeExercicio, nomeTreino, dataDoTreino))
            series = cursor.fetchall()
            
            lista_exercicios.append({
                "nome": nomeExercicio,
                "numeroSeries": numeroSeries,
                "series": series
            })
            
    resposta.append({
        "nomeTreino": nomeTreino,
        "nomeRotina": nomeRotina,
        "dataDoTreino": dataDoTreino,
        "exercicios": lista_exercicios
    })
            
    cursor.close()
    conn.close()

    return jsonify(resposta), 200