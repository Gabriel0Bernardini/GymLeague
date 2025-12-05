from flask import Blueprint, jsonify, request
from db import get_conn

editar_bp = Blueprint("editar", __name__, url_prefix="/editar")

@editar_bp.post("/peso")
def editar_peso():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    dados = request.get_json()

    if dados is None:
        return jsonify({"erro": "Body JSON ausente"}), 400
    usuarioEmail = dados.get("usuarioEmail")
    if usuarioEmail is None:
        return jsonify({"erro": "usuarioEmail ausente"}), 400
    
    novoPeso = dados.get("peso")

    try:
        SQL = """
        UPDATE Usuario SET peso = %s
        WHERE email = %s"""    

        cursor.execute(SQL, (novoPeso, usuarioEmail))

        SQL = """SELECT percentual_gordura
        FROM Usuario
        WHERE email = %s"""
        cursor.execute(SQL, (usuarioEmail,))
        resultado = cursor.fetchone()
        percentual = resultado["percentual_gordura"]

        SQL = """
        INSERT INTO HistoricoUsuario(peso,dataPesagem, percentual_gordura, fkEmailUsuario)
        VALUES(%s, CURRENT_DATE(), %s, %s)"""
        cursor.execute(SQL, (novoPeso, percentual, usuarioEmail))
        conn.commit()
        return jsonify({"mensagem": "Peso atualizado com sucesso"}), 200
    except Exception as e:
        print("ERRO NO /editar/peso:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
