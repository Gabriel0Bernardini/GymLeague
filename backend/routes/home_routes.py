from db import get_conn
from utils.auth import require_auth
from flask import Blueprint, jsonify, request, g
import mysql.connector

home_bp = Blueprint('home_routes', __name__)


@home_bp.get("/peso_percentual")
@require_auth
def get_peso_percentual():
    conn = None
    cursor = None
    try:
        email = g.user['email']
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        SQL = """
            SELECT peso, percentual_gordura
            FROM Usuario
            WHERE email = %s
            """
        cursor.execute(SQL, (email,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Usuário não encontrado."}), 404

        # normalizar percentual (se estiver entre 0 e 1, converte para 0-100)
        pg = result.get('percentual_gordura')
        if pg is not None:
            try:
                pg_num = float(pg)
                if pg_num <= 1:
                    pg_num = pg_num * 100
                result['percentual_gordura'] = pg_num
            except Exception:
                pass

        return jsonify(result), 200
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Erro ao buscar dados de peso e percentual de gordura."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@home_bp.get("/ranking")
@require_auth
def get_ranking():
    conn = None
    cursor = None
    try:
        email = g.user['email']
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        SQL = """
            SELECT ranking_geral
            FROM Usuario
            WHERE email = %s
        """
        cursor.execute(SQL, (email,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"message": "Ranking não encontrado."}), 404

        return jsonify({"rankingGeral": row.get('ranking_geral')}), 200
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Erro ao buscar ranking."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@home_bp.get("/metas")
@require_auth
def get_metas():
    """
    Retorna a meta (tipo 'P' ou 'G') mais próxima de ser completada.
    Calcula o percentual de completude comparando o valor atual do usuário
    (peso ou percentual de gordura) com o objetivo da meta.
    """
    conn = None
    cursor = None
    try:
        email = g.user['email']
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        # buscar usuario
        SQL_USER = """
            SELECT peso, percentual_gordura
            FROM Usuario
            WHERE email = %s
        """
        cursor.execute(SQL_USER, (email,))
        usuario = cursor.fetchone()
        if not usuario:
            return jsonify({"error": "Usuário não encontrado."}), 404

        # normalizar percentual do usuario para 0-100
        pg = usuario.get('percentual_gordura')
        try:
            pg_num = float(pg) if pg is not None else None
            if pg_num is not None and pg_num <= 1:
                pg_num = pg_num * 100
            usuario['percentual_gordura'] = pg_num
        except Exception:
            usuario['percentual_gordura'] = pg

        # buscar metas do usuario (apenas tipo P ou G) e incluir valor_inicial
        SQL_METAS = """
            SELECT titulo, objetivo, tipo, valor_inicial
            FROM Metas
            WHERE fk_emailUsuario = %s
              AND tipo IN ('P','G')
        """
        cursor.execute(SQL_METAS, (email,))
        metas = cursor.fetchall() or []

        if not metas:
            return jsonify({"message": "Nenhuma meta P ou G encontrada."}), 404

        # para cada meta, calcular quão próxima está do objetivo (maior percentComplete é melhor)
        candidatos = []
        for m in metas:
            tipo = (m.get('tipo') or '').upper()
            objetivo = m.get('objetivo')
            titulo = m.get('titulo')
            inicial = m.get('valor_inicial')

            if objetivo is None:
                continue

            try:
                objetivo_num = float(objetivo)
            except Exception:
                continue

            if tipo == 'P':
                atual = usuario.get('peso')
                if atual is None:
                    continue
                try:
                    atual_num = float(atual)
                except Exception:
                    continue

                # se tivermos valor_inicial, calcule percentComplete relativo a ele
                if inicial is not None:
                    try:
                        inicial_num = float(inicial)
                        # evita divisão por zero
                        if objetivo_num == inicial_num:
                            if atual_num == objetivo_num:
                                pct = 100.0
                            else:
                                pct = 0.0
                        else:
                            pct = ((atual_num - inicial_num) / (objetivo_num - inicial_num)) * 100.0
                    except Exception:
                        # fallback para método antigo
                        diff = abs(atual_num - objetivo_num)
                        pct = 100 - min(100, (diff / max(abs(objetivo_num), 1)) * 100)
                else:
                    diff = abs(atual_num - objetivo_num)
                    pct = 100 - min(100, (diff / max(abs(objetivo_num), 1)) * 100)

                # clamp 0..100
                try:
                    pct = max(0.0, min(100.0, float(pct)))
                except Exception:
                    pct = 0.0

                candidatos.append((pct, m, atual_num))

            elif tipo == 'G':
                atual = usuario.get('percentual_gordura')
                if atual is None:
                    continue
                try:
                    atual_num = float(atual)
                except Exception:
                    continue

                if inicial is not None:
                    try:
                        inicial_num = float(inicial)
                        if objetivo_num == inicial_num:
                            pct = 100.0 if atual_num == objetivo_num else (0.0 if atual_num == inicial_num else 0.0)
                        else:
                            pct = ((atual_num - inicial_num) / (objetivo_num - inicial_num)) * 100.0
                    except Exception:
                        diff = abs(atual_num - objetivo_num)
                        pct = 100 - min(100, (diff / max(abs(objetivo_num), 1)) * 100)
                else:
                    diff = abs(atual_num - objetivo_num)
                    pct = 100 - min(100, (diff / max(abs(objetivo_num), 1)) * 100)

                try:
                    pct = max(0.0, min(100.0, float(pct)))
                except Exception:
                    pct = 0.0

                candidatos.append((pct, m, atual_num))

        if not candidatos:
            return jsonify({"message": "Nenhuma meta válida encontrada ou faltam dados do usuário."}), 404

        # escolher a meta com maior percentComplete
        candidatos.sort(key=lambda x: x[0], reverse=True)
        melhor_pct, melhor_meta, atual_val = candidatos[0]

        resposta = {
            "meta": {
                "titulo": melhor_meta.get('titulo'),
                "objetivo": float(melhor_meta.get('objetivo')),
                "tipo": melhor_meta.get('tipo'),
                "valorInicial": (float(melhor_meta.get('valor_inicial')) if melhor_meta.get('valor_inicial') is not None else None),
            },
            "usuario": {
                "peso": usuario.get('peso'),
                "percentual_gordura": usuario.get('percentual_gordura'),
            },
            "percentComplete": round(float(melhor_pct), 2),
            "valorAtual": atual_val,
        }

        return jsonify(resposta), 200
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Erro ao buscar metas."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
            
@home_bp.get("/ultimo_treino")
@require_auth
def get_ultimo_treino():
    """
    Retorna informações do último treino do usuário:
      - dataDoTreino (string)
      - nomeDoTreino (string)
      - nomeDaRotina (string|null)
      - proximosTreinos (array de strings) -> outros treinos da mesma rotina
    """
    conn = None
    cursor = None
    try:
        email = g.user['email']
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        # pega o treino mais recente (exclui placeholders '9999-12-31')
        SQL = """
            SELECT dataDoTreino, fkNomeTreino
            FROM UsuarioTreino
            WHERE fEmail_UsuarioTreino = %s
              AND dataDoTreino <> '9999-12-31'
            ORDER BY dataDoTreino DESC
            LIMIT 1
        """
        cursor.execute(SQL, (email,))
        treinoDataRecente = cursor.fetchone()

        if not treinoDataRecente:
            return jsonify({"message": "Nenhum treino encontrado."}), 404

        nome_treino = treinoDataRecente.get('fkNomeTreino')

        # tenta obter a rotina à qual o treino pertence
        SQL_ROTINA = """
            SELECT fkNomeRotina
            FROM TreinoRotina
            WHERE fkNomeTreino = %s
              AND fkEmail_CriadorTreino = %s
            LIMIT 1
        """
        cursor.execute(SQL_ROTINA, (nome_treino, email))
        rotina_row = cursor.fetchone()
        nome_rotina = rotina_row.get('fkNomeRotina') if rotina_row else None

        # lista outros treinos da mesma rotina (exclui o treino atual)
        proximos_list = []
        if nome_rotina:
            SQL_PROX = """
                SELECT fkNomeTreino
                FROM TreinoRotina
                WHERE fkNomeRotina = %s
                  AND fkEmail_CriadorTreino = %s
                  AND fkNomeTreino <> %s
            """
            cursor.execute(SQL_PROX, (nome_rotina, email, nome_treino))
            proximos_rows = cursor.fetchall() or []
            proximos_list = [r.get('fkNomeTreino') for r in proximos_rows if r.get('fkNomeTreino')]

        result = {
            "dataDoTreino": treinoDataRecente.get('dataDoTreino'),
            "nomeDoTreino": nome_treino,
            "nomeDaRotina": nome_rotina,
            "proximosTreinos": proximos_list,
        }

        return jsonify(result), 200
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": "Erro ao buscar dados do último treino."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()