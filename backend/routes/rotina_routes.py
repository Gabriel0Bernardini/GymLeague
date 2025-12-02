# backend/routes/rotina_routes.py
from flask import Blueprint, jsonify, request, g
from utils.auth import require_auth
from db import get_conn
from mysql.connector import IntegrityError
import datetime

rotinas_bp = Blueprint("rotinas", __name__, url_prefix="/rotinas")

@rotinas_bp.get("/")
@require_auth
def listar_rotinas():
    email = g.user["email"]
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT nome, publico
        FROM Rotina
        WHERE fEmail_usuarioCriador = %s
    """, (email,))
    rotinas = cur.fetchall()
    cur.close()
    conn.close()

    resultados = []
    for i, r in enumerate(rotinas):
        resultados.append({"id": i + 1, "nome": r["nome"], "publico": bool(r.get("publico", False))})
    return jsonify(resultados), 200


@rotinas_bp.post("/")
@require_auth
def criar_rotina():
    
    if not request.is_json:
        return jsonify({"code": "BAD_REQUEST", "message": "Corpo inválido"}), 400

    payload = request.get_json()
    nome_rotina = (payload.get("nome") or "").strip()
    fichas = payload.get("fichas") or []
    publico_rotina = bool(payload.get("publico", False))
    # usamos uma data placeholder para treinos criados por rotinas
    # isso evita depender da data do PC; usamos o máximo permitido pelo MySQL (9999-12-31)
    placeholder_date = datetime.date.max
    
    if not nome_rotina:
        return jsonify({"code": "BAD_REQUEST", "message": "Nome da rotina é obrigatório"}), 400

    email = g.user["email"]

    conn = get_conn()
    cur = conn.cursor()

    try:
        # 1) Inserir Rotina (verifica se já existe)
        # Rotina tem PK (nome, fEmail_usuarioCriador)
        cur.execute("""
                INSERT INTO Rotina (nome, fEmail_usuarioCriador, publico)
                VALUES (%s, %s, %s)
            """, (nome_rotina, email, publico_rotina))

        # Limpar treinos ligados à rotina
        cur.execute("""
            DELETE FROM TreinoRotina
            WHERE fkNomeRotina = %s AND fkEmail_CriadorRotina = %s
        """, (nome_rotina, email))


        # META PLACEHOLDER MUDAR DEPOIS
        cur.execute("""
            SELECT 1 FROM Metas 
            WHERE titulo = %s AND fk_emailUsuario = %s
        """, ("MetaPadrão", email))

        existe = cur.fetchone()
        if not existe:
            cur.execute("INSERT INTO Metas (titulo, fk_emailUsuario, objetivo, descricao, tipo) VALUES (%s, %s, %s, %s, %s)",
                        ("MetaPadrão", email, 3.14, "", "p"))


        
        
            
        # 2) Para cada ficha: criar Treino (se necessário) e inserir TreinoRotina
        for ficha in fichas:
            nome_ficha = (ficha.get("nome") or "").strip()
            exercicios = ficha.get("exercicios", [])
            
            
            
            
            if not nome_ficha:
                raise ValueError("Cada ficha precisa ter um nome")

            # criar Treino (chave PK: nome, fEmail_usuarioCriador)
            ficha_publico = bool(ficha.get("publico", False))
            cur.execute("SELECT 1 FROM Treino WHERE nome = %s AND fEmail_usuarioCriador = %s", (nome_ficha, email))
            if not cur.fetchone():
                cur.execute("INSERT INTO Treino (nome, fEmail_usuarioCriador, publico) VALUES (%s, %s, %s)",
                            (nome_ficha, email, ficha_publico))
            else:
                # se já existir, atualiza flag publico do treino conforme payload
                cur.execute("UPDATE Treino SET publico = %s WHERE nome = %s AND fEmail_usuarioCriador = %s",
                            (ficha_publico, nome_ficha, email))

            # inserir ligação TreinoRotina
            cur.execute("""
                INSERT IGNORE INTO TreinoRotina (
                    fkEmail_CriadorTreino, fkNomeTreino, fkEmail_CriadorRotina, fkNomeRotina
                ) VALUES (%s, %s, %s, %s)
            """, (email, nome_ficha, email, nome_rotina))
            
            # limpar TreinoExercicio do treino
            cur.execute("""
                DELETE FROM TreinoExercicio
                WHERE fkEmail_CriadorTreino = %s AND fkNomeTreino = %s
            """, (email, nome_ficha))

        
               
            #TABELA USUSARIO TREINO PLACEHOLDER MUDAR DEPOIS
        
            cur.execute("""
                    SELECT 1 FROM UsuarioTreino
                    WHERE fEmail_UsuarioTreino = %s AND fkNomeTreino = %s AND dataDoTreino = %s
                """, (email, nome_ficha, placeholder_date))
            existe_ut = cur.fetchone()
            
            if not existe_ut:
                cur.execute("""
                    INSERT INTO UsuarioTreino (fkEmail_CriadorTreino,fEmail_UsuarioTreino, fkNomeTreino, dataDoTreino)
                    VALUES (%s, %s, %s, %s)
                """, (email, email, nome_ficha, placeholder_date))
            
            
            # limpar Series do treino também
            cur.execute("""
                DELETE FROM Serie
                WHERE fkEmail_CriadorTreino = %s AND fkNomeTreino = %s
            """, (email, nome_ficha))
            
            
            # 3) Para cada exercício da ficha: garantir Exercicio e inserir TreinoExercicio
            for ex in exercicios:
                nome_ex = ex.get("nome")
                num_series = int(ex.get("series") or 0)
                descricao = ex.get("descricao", "")
                seriesData = ex.get("seriesData", [])

                if not nome_ex:
                    continue

                # Criar TreinoExercicio
                cur.execute("""
                    INSERT INTO TreinoExercicio (
                        num_Series, descricao,
                        fkEmail_CriadorTreino, fkNomeTreino, fkNomeExercicio
                    )
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    num_series,
                    descricao,
                    email,
                    nome_ficha,
                    nome_ex
                ))

                # Inserir cada série
                for idx, serie in enumerate(seriesData, start=1):
                    
                    
                    carga_raw = serie.get("carga")
                    try:
                        carga = float(carga_raw) if carga_raw not in (None, "", " ") else 0
                    except:
                        carga = 0

                    # Repetições
                    repeticoes_raw = serie.get("repeticoes")
                    try:
                        repeticoes = int(repeticoes_raw) if repeticoes_raw not in (None, "", " ") else 0
                    except:
                        repeticoes = 0

                    # Detalhe
                    detalhe = serie.get("detalhe") or ""
                    
                    
                    cur.execute("""
                        INSERT INTO Serie (
                            numero, detalhe, repeticoes, carga,
                            fk_nomeExercicio, fkNomeTreino,
                            fkEmail_CriadorTreino, fEmail_UsuarioTreino,
                            fk_dataDoTreino, fk_tituloMeta
                        )
                        VALUES (
                            %s, %s, %s, %s,
                            %s, %s,
                            %s, %s,
                            %s, %s
                        )
                    """, (
                        idx,
                        detalhe,
                        repeticoes,
                        carga,
                        nome_ex,
                        nome_ficha,
                        email,
                        email,  # por enquanto o usuário do treino é o criador
                        placeholder_date,
                        "MetaPadrão"  # título da meta padrão
                    ))

        conn.commit()

    except ValueError as ve:
        conn.rollback()
        return jsonify({"code": "BAD_REQUEST", "message": str(ve)}), 400
    except IntegrityError as ie:
        print("ERRO SQL:", ie) 
        conn.rollback()
        return jsonify({"code": "INTERNAL_ERROR", "message": "Erro de integridade: " + str(ie)}), 501
    except Exception as e:
        print("ERRO SQL:", e) 
        conn.rollback()
        return jsonify({"code": "INTERNAL_ERROR", "message": "Erro ao criar rotina", "detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Rotina criada"}), 201



@rotinas_bp.get("/<nome_rotina>")
@require_auth
def obter_rotina(nome_rotina):
    email = g.user["email"]
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    try:
        # Buscar rotina
        cur.execute("""
            SELECT nome, publico 
            FROM Rotina
            WHERE nome = %s AND fEmail_usuarioCriador = %s
        """, (nome_rotina, email))
        rotina = cur.fetchone()

        if not rotina:
            return jsonify({"message": "Rotina não encontrada"}), 404

        # Buscar fichas da rotina (Treinos)
        cur.execute("""
                SELECT t.nome, t.publico
                FROM Treino t
                JOIN TreinoRotina tr
                    ON tr.fkNomeTreino = t.nome
                    AND tr.fkEmail_CriadorTreino = t.fEmail_usuarioCriador
                WHERE tr.fkEmail_CriadorRotina = %s
                    AND tr.fkNomeRotina = %s
        """, (email, nome_rotina))
        fichas = cur.fetchall()

        resultado = {
            "nome": rotina["nome"],
            "publico": bool(rotina.get("publico", False)),
            "fichas": []
        }

        # Para cada ficha, buscar exercícios e séries
        for f in fichas:
            nome_ficha = f["nome"]

            # Exercícios da ficha
            cur.execute("""
                SELECT 
                    te.fkNomeExercicio AS nome,
                    te.num_Series AS series, 
                    te.descricao
                FROM TreinoExercicio te
                WHERE te.fkNomeTreino = %s
                AND te.fkEmail_CriadorTreino = %s
            """, (nome_ficha, email))
            exercicios = cur.fetchall()

            # Séries por exercício da ficha
            cur.execute("""
                SELECT 
                    s.fk_nomeExercicio AS nomeExercicio,
                    s.numero,
                    s.detalhe,
                    s.repeticoes,
                    s.carga
                FROM Serie s
                WHERE s.fkNomeTreino = %s
                AND s.fkEmail_CriadorTreino = %s
                ORDER BY s.fk_nomeExercicio, s.numero
            """, (nome_ficha, email))
            series_rows = cur.fetchall()

            series_map = {}
            for row in series_rows:
                series_map.setdefault(row["nomeExercicio"], []).append({
                    "numero": row["numero"],
                    "detalhe": row["detalhe"] or "",
                    "repeticoes": "" if row["repeticoes"] is None else str(row["repeticoes"]),
                    "carga": "" if row["carga"] is None else str(row["carga"]),
                })

            resultado["fichas"].append({
                "nome": nome_ficha,
                "publico": bool(f.get("publico", False)) if isinstance(f, dict) else False,
                "exercicios": [
                    {
                        **ex,
                        "seriesData": series_map.get(ex["nome"], []),
                        "series": ex.get("series") or "",
                        "descricao": ex.get("descricao") or "",
                    } for ex in exercicios
                ]
            })

        return jsonify(resultado), 200
    finally:
        cur.close()
        conn.close()


@rotinas_bp.delete("/<nome_rotina>")
@require_auth
def excluir_rotina(nome_rotina):
    email = g.user["email"]
    conn = get_conn()
    cur = conn.cursor()

    try:
        # Verificar se rotina existe
        cur.execute("""
            SELECT 1 FROM Rotina
            WHERE nome = %s AND fEmail_usuarioCriador = %s
        """, (nome_rotina, email))

        if not cur.fetchone():
            return jsonify({"message": "Rotina não encontrada"}), 404

        # 1) Buscar todas as fichas (treinos) dessa rotina
        cur.execute("""
            SELECT fkNomeTreino, fkEmail_CriadorTreino
            FROM TreinoRotina
            WHERE fkEmail_CriadorRotina = %s
            AND fkNomeRotina = %s
        """, (email, nome_rotina))
        
        fichas = cur.fetchall()


        # 2) Apagar vínculo Treino ↔ Rotina
        cur.execute("""
            DELETE FROM TreinoRotina
            WHERE fkEmail_CriadorRotina = %s
              AND fkNomeRotina = %s
        """, (email, nome_rotina))

        # 3) Para cada ficha, apagar exercícios da ficha
        for nome_ficha, _ in fichas:
            # apagar exercícios ligados ao treino
            cur.execute("""
                DELETE FROM TreinoExercicio
                WHERE fkNomeTreino = %s
                  AND fkEmail_CriadorTreino = %s
            """, (nome_ficha, email))

            # apagar séries ligadas ao treino
            cur.execute("""
                DELETE FROM Serie
                WHERE fkNomeTreino = %s
                  AND fkEmail_CriadorTreino = %s
            """, (nome_ficha, email))

            # Se o treino não está mais vinculado a nenhuma rotina, apagar o próprio Treino
            cur.execute("""
                SELECT 1 FROM TreinoRotina
                WHERE fkNomeTreino = %s AND fkEmail_CriadorTreino = %s
                LIMIT 1
            """, (nome_ficha, email))
            if not cur.fetchone():
                # apagar entradas de usuário/treino relacionadas (histórico)
                cur.execute("""
                    DELETE FROM UsuarioTreino
                    WHERE fkNomeTreino = %s AND fkEmail_CriadorTreino = %s
                """, (nome_ficha, email))

                # finalmente apagar o Treino
                cur.execute("""
                    DELETE FROM Treino
                    WHERE nome = %s AND fEmail_usuarioCriador = %s
                """, (nome_ficha, email))

        # 4) Remover a própria rotina
        cur.execute("""
            DELETE FROM Rotina
            WHERE nome = %s AND fEmail_usuarioCriador = %s
        """, (nome_rotina, email))

        conn.commit()

    except Exception as e:
        print(fichas)
        conn.rollback()
        return jsonify({"message": "Erro ao excluir rotina", "detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Rotina removida"}), 200


#EDICAO de rotina
@rotinas_bp.put("/<nome_rotina>")
@require_auth
def editar_rotina(nome_rotina):
    if not request.is_json:
        return jsonify({"code": "BAD_REQUEST", "message": "Corpo inválido"}), 400

    payload = request.get_json()
    novo_nome = (payload.get("nome") or "").strip()
    fichas = payload.get("fichas") or []
    publico_rotina = bool(payload.get("publico", False))
    # use placeholder date instead of current PC date
    placeholder_date = datetime.date.max

    if not novo_nome:
        return jsonify({"code": "BAD_REQUEST", "message": "Nome da rotina é obrigatório"}), 400

    email = g.user["email"]

    conn = get_conn()
    cur = conn.cursor()

    try:
        # 1) Verifica se existe
        cur.execute("""
            SELECT 1 FROM Rotina 
            WHERE nome = %s AND fEmail_usuarioCriador = %s
        """, (nome_rotina, email))

        if not cur.fetchone():
            return jsonify({"message": "Rotina não encontrada"}), 404

        # 2) Apagar vínculos antigos
        cur.execute("""
            SELECT fkNomeTreino 
            FROM TreinoRotina
            WHERE fkEmail_CriadorRotina = %s AND fkNomeRotina = %s
        """, (email, nome_rotina))

        fichas_antigas = [row[0] for row in cur.fetchall()]

        for ficha in fichas_antigas:
            # limpar séries existentes do treino
            cur.execute("""
                DELETE FROM Serie
                WHERE fkNomeTreino = %s AND fkEmail_CriadorTreino = %s
            """, (ficha, email))
            cur.execute("""
                DELETE FROM TreinoExercicio
                WHERE fkNomeTreino = %s AND fkEmail_CriadorTreino = %s
            """, (ficha, email))

        cur.execute("""
            DELETE FROM TreinoRotina
            WHERE fkEmail_CriadorRotina = %s AND fkNomeRotina = %s
        """, (email, nome_rotina))

        # 3) Atualizar nome da rotina (se mudou)
        if novo_nome != nome_rotina:
            cur.execute("""
                UPDATE Rotina
                SET nome = %s, publico = %s
                WHERE nome = %s AND fEmail_usuarioCriador = %s
            """, (novo_nome, publico_rotina, nome_rotina, email))
        else:
            # Atualiza apenas o campo publico se o nome não mudou
            cur.execute("""
                UPDATE Rotina
                SET publico = %s
                WHERE nome = %s AND fEmail_usuarioCriador = %s
            """, (publico_rotina, nome_rotina, email))

        # 4) Reinsere tudo novamente (mesma lógica da criação)
        for ficha in fichas:
            nome_ficha = (ficha.get("nome") or "").strip()
            if not nome_ficha:
                raise ValueError("Ficha sem nome")

            cur.execute("""
                SELECT 1 FROM Treino 
                WHERE nome = %s AND fEmail_usuarioCriador = %s
            """, (nome_ficha, email))
            if not cur.fetchone():
                ficha_publico = bool(ficha.get("publico", False))
                cur.execute("""
                    INSERT INTO Treino (nome, fEmail_usuarioCriador, publico)
                    VALUES (%s, %s, %s)
                """, (nome_ficha, email, ficha_publico))
            
                # se já existir, garantir que a flag publico siga o payload
                cur.execute("UPDATE Treino SET publico = %s WHERE nome = %s AND fEmail_usuarioCriador = %s",
                            (ficha_publico, nome_ficha, email))

            # Treino ↔ Rotina
            cur.execute("""
                INSERT INTO TreinoRotina (
                    fkEmail_CriadorTreino, fkNomeTreino, fkEmail_CriadorRotina, fkNomeRotina
                ) VALUES (%s, %s, %s, %s)
            """, (email, nome_ficha, email, novo_nome))

            # garantir usuário/treino com data placeholder para FK de Série
            cur.execute("""
                SELECT 1 FROM UsuarioTreino
                WHERE fEmail_UsuarioTreino = %s AND fkNomeTreino = %s AND dataDoTreino = %s
            """, (email, nome_ficha, placeholder_date))
            if not cur.fetchone():
                cur.execute("""
                    INSERT INTO UsuarioTreino (fkEmail_CriadorTreino, fEmail_UsuarioTreino, fkNomeTreino, dataDoTreino)
                    VALUES (%s, %s, %s, %s)
                """, (email, email, nome_ficha, placeholder_date))

            # Exercícios
            for ex in ficha.get("exercicios", []):
                nome_ex = (ex.get("nome") or "").strip()
                if not nome_ex:
                    raise ValueError("Exercício sem nome")

                cur.execute("SELECT 1 FROM Exercicio WHERE nome = %s", (nome_ex,))
                if not cur.fetchone():
                    cur.execute("INSERT INTO Exercicio (nome) VALUES (%s)", (nome_ex,))

                series = ex.get("series") or 1
                desc = ex.get("descricao") or ""
                seriesData = ex.get("seriesData") or []

                cur.execute("""
                    INSERT INTO TreinoExercicio 
                    (num_Series, descricao, fkEmail_CriadorTreino, fkNomeTreino, fkNomeExercicio)
                    VALUES (%s, %s, %s, %s, %s)
                """, (series, desc, email, nome_ficha, nome_ex))

                for idx, serie in enumerate(seriesData, start=1):
                    carga_raw = serie.get("carga")
                    try:
                        carga = float(carga_raw) if carga_raw not in (None, "", " ") else 0
                    except Exception:
                        carga = 0

                    repeticoes_raw = serie.get("repeticoes")
                    try:
                        repeticoes = int(repeticoes_raw) if repeticoes_raw not in (None, "", " ") else 0
                    except Exception:
                        repeticoes = 0

                    detalhe = serie.get("detalhe") or ""

                    cur.execute("""
                        INSERT INTO Serie (
                            numero, detalhe, repeticoes, carga,
                            fk_nomeExercicio, fkNomeTreino,
                            fkEmail_CriadorTreino, fEmail_UsuarioTreino,
                            fk_dataDoTreino, fk_tituloMeta
                        )
                        VALUES (
                            %s, %s, %s, %s,
                            %s, %s,
                            %s, %s,
                            %s, %s
                        )
                    """, (
                        idx,
                        detalhe,
                        repeticoes,
                        carga,
                        nome_ex,
                        nome_ficha,
                        email,
                        email,
                        placeholder_date,
                        "MetaPadrão"
                    ))

        conn.commit()

    except Exception as e:
        conn.rollback()
        return jsonify({"message": "Erro ao editar rotina", "detail": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "Rotina atualizada"}), 200
