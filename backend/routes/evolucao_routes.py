from db import get_conn
from utils.auth import require_auth
from flask import Blueprint, jsonify, request, g
import mysql.connector


evolucao_bp = Blueprint("evolucao", __name__, url_prefix="/evolucao")


@evolucao_bp.get("/treinoCompletoData")
@require_auth
def get_treinoCompletoData():
    conn = None
    cursor = None
    try:
        email = g.user["email"]
        conn = get_conn()
        cursor = conn.cursor(dictionary=True, buffered=True)

        resposta = []

        SQL = """
            SELECT fknomeTreino, dataDoTreino
            FROM UsuarioTreino
            WHERE fEmail_UsuarioTreino = %s
            AND dataDoTreino <> '9999-12-31'
        """
        cursor.execute(SQL, (email,))
        treinosData = cursor.fetchall()

        for treino in treinosData:
            nomeTreino = treino["fknomeTreino"]
            dataDoTreino = treino["dataDoTreino"]

            # usar cursor separado para queries internas para evitar resultados não lidos
            inner = conn.cursor(dictionary=True, buffered=True)
            try:
                SQL = """
                    SELECT fkNomeRotina
                    FROM TreinoRotina
                    WHERE fkEmail_CriadorTreino = %s
                    AND fkEmail_CriadorRotina = %s
                    AND fkNomeTreino = %s
                """
                inner.execute(SQL, (email, email, nomeTreino))
                rotina = inner.fetchone()

                nomeRotina = rotina["fkNomeRotina"] if rotina else None

                SQL = """
                    SELECT num_Series, descricao, fkNomeExercicio
                    FROM TreinoExercicio
                    WHERE fkEmail_CriadorTreino = %s
                    AND fkNomeTreino = %s
                """
                inner.execute(SQL, (email, nomeTreino))
                exercicios = inner.fetchall()

                lista_exercicios = []

                for exercicio in exercicios:
                    nomeExercicio = exercicio["fkNomeExercicio"]
                    numeroSeries = exercicio["num_Series"]

                    SQL = """
                        SELECT numero, detalhe, repeticoes, carga
                        FROM Serie
                        WHERE fEmail_UsuarioTreino = %s
                        AND fkEmail_CriadorTreino = %s
                        AND fk_nomeExercicio = %s
                        AND fkNomeTreino = %s
                        AND fk_dataDoTreino = %s
                    """
                    inner.execute(SQL, (email, email, nomeExercicio, nomeTreino, dataDoTreino))
                    series = inner.fetchall()

                    lista_exercicios.append({
                        "nome": nomeExercicio,
                        "numeroSeries": numeroSeries,
                        "series": series,
                    })

                resposta.append({
                    "nomeTreino": nomeTreino,
                    "nomeRotina": nomeRotina,
                    "dataDoTreino": str(dataDoTreino),
                    "exercicios": lista_exercicios,
                })
            finally:
                try:
                    inner.close()
                except Exception:
                    pass

        # fechar cursor/conn e retornar
        cursor.close()
        conn.close()
        return jsonify(resposta), 200

    except mysql.connector.Error as db_err:
        print("DB ERROR:", db_err)
        # tentar fechar recursos sem lançar
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro interno no BD"}), 500

    except Exception as err:
        print("SERVER ERROR:", err)
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro no servidor"}), 500


@evolucao_bp.get("/pesoCorporal")
@require_auth
def get_evolucaoPesoCorporal():
    conn = None
    cursor = None
    try:
        email = g.user["email"]
        conn = get_conn()
        cursor = conn.cursor(dictionary=True, buffered=True)

        SQL = """
            SELECT peso, dataPesagem
            FROM HistoricoUsuario
            WHERE fkEmailUsuario = %s
            ORDER BY dataPesagem ASC
        """
        cursor.execute(SQL, (email,))
        rows = cursor.fetchall()

        cursor.close()
        conn.close()
        return jsonify({"pesagens": rows})

    except mysql.connector.Error as db_err:
        print("DB ERROR:", db_err)
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro interno no BD"}), 500

    except Exception as err:
        print("SERVER ERROR:", err)
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro no servidor"}), 500


@evolucao_bp.get("/percentualGordura")
@require_auth
def get_evolucaoPercentualGordura():
    conn = None
    cursor = None
    try:
        email = g.user["email"]
        conn = get_conn()
        cursor = conn.cursor(dictionary=True, buffered=True)

        SQL = """
            SELECT percentual_gordura, dataPesagem
            FROM HistoricoUsuario
            WHERE fkEmailUsuario = %s
            ORDER BY dataPesagem ASC
        """
        cursor.execute(SQL, (email,))
        rows = cursor.fetchall()

        # Converter percentual de gordura de 0-1 para 0-100
        resultado = [
            {
                "percentual_gordura": float(row["percentual_gordura"]) * 100 if row["percentual_gordura"] else 0,
                "dataPesagem": row["dataPesagem"]
            }
            for row in rows
        ]

        cursor.close()
        conn.close()
        return jsonify({"gordura": resultado})

    except mysql.connector.Error as db_err:
        print("DB ERROR:", db_err)
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro interno no BD"}), 500

    except Exception as err:
        print("SERVER ERROR:", err)
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro no servidor"}), 500


@evolucao_bp.get("/exerciciosRealizados")
@require_auth
def get_exerciciosRealizados():
    conn = None
    cursor = None
    try:
        email = g.user["email"]
        conn = get_conn()
        cursor = conn.cursor(dictionary=True, buffered=True)

        SQL = """
            SELECT DISTINCT 
                s.fk_nomeExercicio AS nome,
                MAX(s.fk_dataDoTreino) AS ultimaData
            FROM Serie s
            WHERE s.fEmail_UsuarioTreino = %s
            AND s.fk_dataDoTreino <> '9999-12-31'
            GROUP BY s.fk_nomeExercicio
            ORDER BY s.fk_nomeExercicio ASC
        """
        cursor.execute(SQL, (email,))
        exercicios = cursor.fetchall()

        resultado = [
            {
                "nome": ex["nome"],
                "ultimaData": str(ex["ultimaData"]) if ex["ultimaData"] else None,
            }
            for ex in exercicios
        ]

        cursor.close()
        conn.close()
        return jsonify({"exercicios": resultado}), 200

    except mysql.connector.Error as db_err:
        print("DB ERROR:", db_err)
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro interno no BD"}), 500

    except Exception as err:
        print("SERVER ERROR:", err)
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro no servidor"}), 500


@evolucao_bp.get("/evolucaoExercicio/<nome_exercicio>")
@require_auth
def get_evolucaoExercicio(nome_exercicio):
    conn = None
    cursor = None
    try:
        email = g.user["email"]
        conn = get_conn()
        cursor = conn.cursor(dictionary=True, buffered=True)

        SQL = """
            SELECT 
                s.fk_dataDoTreino AS data,
                s.carga AS peso,
                s.repeticoes,
                s.numero AS numeroSerie,
                t.nome AS nomeTreino
            FROM Serie s
            JOIN Treino t ON s.fkNomeTreino = t.nome 
                AND s.fkEmail_CriadorTreino = t.fEmail_usuarioCriador
            WHERE s.fEmail_UsuarioTreino = %s
            AND s.fk_nomeExercicio = %s
            AND s.fk_dataDoTreino <> '9999-12-31'
            ORDER BY s.fk_dataDoTreino ASC, s.numero ASC
        """
        cursor.execute(SQL, (email, nome_exercicio))
        series = cursor.fetchall()

        # Agrupar por data para obter peso máximo e repeticoes
        dados_por_data = {}
        for serie in series:
            data = str(serie["data"])
            if data not in dados_por_data:
                dados_por_data[data] = {
                    "data": data,
                    "nomeTreino": serie.get("nomeTreino"),
                    "pesoMaximo": serie["peso"] or 0,
                    "repeticoes": [],
                }

            if serie["peso"] and serie["peso"] > dados_por_data[data]["pesoMaximo"]:
                dados_por_data[data]["pesoMaximo"] = serie["peso"]

            if serie.get("repeticoes"):
                dados_por_data[data]["repeticoes"].append(serie["repeticoes"])

        resultado = list(dados_por_data.values())

        cursor.close()
        conn.close()
        return jsonify({"exercicio": nome_exercicio, "evolucao": resultado}), 200

    except mysql.connector.Error as db_err:
        print("DB ERROR:", db_err)
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro interno no BD"}), 500

    except Exception as err:
        print("SERVER ERROR:", err)
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                conn.close()
        except Exception:
            pass
        return jsonify({"message": "Erro no servidor"}), 500
