from flask import Blueprint, jsonify, request
from db import get_conn

metas_bp = Blueprint("metas", __name__, url_prefix="/metas")

@metas_bp.post("/")
def listar_metas():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    dados = request.get_json()
    if dados is None:
        return jsonify({"erro": "Body JSON ausente"}), 400
    usuarioEmail = dados.get("usuarioEmail")
    if usuarioEmail is None:
        return jsonify({"erro": "usuarioEmail ausente"}), 400
    try:
        SQL = "SELECT * FROM Metas WHERE fk_emailUsuario = %s"
        cursor.execute(SQL, (usuarioEmail,))
        metas = cursor.fetchall() or []
        return jsonify(metas), 200
    except Exception as e:
        print("ERRO NO /metas GET:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    
@metas_bp.post("/criar")
def criar_meta():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    dados = request.get_json()

    print("DEBUG /metas/criar body:", dados)  

    if dados is None:
        return jsonify({"erro": "Body JSON ausente"}), 400

    usuarioEmail = dados.get("usuarioEmail")
    if usuarioEmail is None:
        return jsonify({"erro": "usuarioEmail ausente"}), 400

    
    titulo = dados.get("titulo")
    if titulo is None:
        return jsonify({"erro": "titulo ausente"}), 400

    descricao = dados.get("descricao", "")
    valorMeta = dados.get("valorMeta")
    if valorMeta is None:
        return jsonify({"erro": "valorMeta ausente"}), 400

    tipoMeta = dados.get("tipoMeta")  
    if tipoMeta is None:
        return jsonify({"erro": "tipoMeta ausente"}), 400

    try:
        SQL = """
        INSERT INTO Metas (titulo, descricao, objetivo, tipo, fk_emailUsuario)
        VALUES (%s, %s, %s, %s, %s)
        """
        params = (titulo, descricao, valorMeta, tipoMeta, usuarioEmail)
        print("DEBUG /metas/criar SQL params:", params)  

        cursor.execute(SQL, params)
        conn.commit()
        print("DEBUG /metas/criar: commit efetuado")

        
        SQL_SELECT = "SELECT * FROM Metas WHERE titulo = %s AND fk_emailUsuario = %s"
        cursor.execute(SQL_SELECT, (titulo, usuarioEmail))
        meta_inserida = cursor.fetchone()
        print("DEBUG /metas/criar meta_inserida:", meta_inserida)

        return jsonify({"mensagem": "Meta criada com sucesso", "meta": meta_inserida}), 201

    except Exception as e:
        print("ERRO NO /metas/criar POST:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@metas_bp.put("/editar")
def editar_meta():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    dados = request.get_json()
    if dados is None:
        return jsonify({"erro": "Body JSON ausente"}), 400
    
    usuarioEmail = dados.get("usuarioEmail")
    titulo = dados.get("titulo")
    novo_valor = dados.get("valorMeta")
    novoTipo = dados.get("tipoMeta")
    if None in (usuarioEmail, titulo, novo_valor, novoTipo):
        return jsonify({"erro": "Parâmetros ausentes"}), 400
    novaDescricao = dados.get("descricao", "")

    try:
        SQL = """
        Select * FROM Metas
        WHERE fk_emailUsuario = %s AND titulo = %s"""
        cursor.execute(SQL, (usuarioEmail, titulo))
        meta_existente = cursor.fetchone()
        if not meta_existente:
            return jsonify({"erro": "Meta não encontrada"}), 404


        SQL = """
        UPDATE Metas
        Set objetivo = %s, tipo = %s, descricao = %s
        WHERE fk_emailUsuario = %s AND titulo = %s
        """
        cursor.execute(SQL, (novo_valor, novoTipo, novaDescricao, usuarioEmail, titulo))
        conn.commit()
        return jsonify({"mensagem": "Meta atualizada com sucesso"}), 200
    except Exception as e:
        print("ERRO NO /metas/editar PUT:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
