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
        if tipoMeta == "G":
            try:
                SQL = """
                SELECT percentual_gordura
                FROM Usuario
                WHERE email = %s
                """
                cursor.execute(SQL, (usuarioEmail,))
                row = cursor.fetchone()
                if not row or row.get("percentual_gordura") is None:
                    return jsonify({"erro": "Percentual de gordura do usuário não cadastrado."}), 400
                pg = row.get("percentual_gordura")
                try:
                    pg_num = float(pg)
                    if pg_num <= 1:
                        pg_num = pg_num * 100
                except Exception:
                    return jsonify({"erro": "Valor de percentual de gordura inválido."}), 400
                # armazenar como inteiro (coluna é INT)
                valorInicial = int(round(pg_num))
            except Exception as e:
                print("ERRO AO BUSCAR PERCENTUAL DE GORDURA DO USUARIO:", str(e))
                return jsonify({"erro": "Erro ao buscar percentual de gordura do usuário"}), 500
        elif tipoMeta == "P":
            try:
                SQL = """
                SELECT peso
                FROM Usuario
                WHERE email = %s
                """
                cursor.execute(SQL, (usuarioEmail,))
                row = cursor.fetchone()
                if not row or row.get("peso") is None:
                    return jsonify({"erro": "Peso do usuário não cadastrado."}), 400
                try:
                    peso_num = float(row.get("peso"))
                except Exception:
                    return jsonify({"erro": "Valor de peso inválido."}), 400
                # armazenar como inteiro
                valorInicial = int(round(peso_num))
            except Exception as e:
                print("ERRO AO BUSCAR PESO DO USUARIO:", str(e))
                return jsonify({"erro": "Erro ao buscar peso do usuário"}), 500
        
        SQL = """
        INSERT INTO Metas (titulo, descricao, objetivo, tipo, fk_emailUsuario, valor_inicial)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (titulo, descricao, valorMeta, tipoMeta, usuarioEmail, valorInicial)
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
        WHERE fk_emailUsuario = %s AND titulo = %s AND valor_inicial = %s
        """
        cursor.execute(SQL, (novo_valor, novoTipo, novaDescricao, usuarioEmail, titulo, meta_existente.get("valor_inicial")))
        conn.commit()
        return jsonify({"mensagem": "Meta atualizada com sucesso"}), 200
    except Exception as e:
        print("ERRO NO /metas/editar PUT:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@metas_bp.delete("/deletar")
def deletar_meta():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    dados = request.get_json()
    if dados is None:
        return jsonify({"erro": "Body JSON ausente"}), 400
    usuarioEmail = dados.get("usuarioEmail")
    titulo = dados.get("titulo")
    if None in (usuarioEmail, titulo):
        return jsonify({"erro": "Parâmetros ausentes"}), 400
    
    try:
        SQL = """
            SELECT * FROM Metas 
            Where fk_emailUsuario = %s AND titulo = %s"""
        cursor.execute(SQL, (usuarioEmail, titulo))
        meta_existente = cursor.fetchone()
        if not meta_existente:
            return jsonify({"erro": "Meta não encontrada"}), 404
        
        SQL = """
        DELETE FROM Metas 
        WHERE fk_emailUsuario = %s AND titulo = %s
        """
        cursor.execute(SQL, (usuarioEmail, titulo))
        conn.commit()
        return jsonify({"mensagem": "Meta deletada com sucesso"}), 200
    except Exception as e:
        print("ERRO NO /metas/deletar DELETE:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"erro": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
