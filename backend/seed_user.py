# backend/seed_user.py
from db import get_conn

def insert_user(username: str, name: str, password: str) -> None:
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()

        # evita duplicar usuário (coluna username é UNIQUE)
        cur.execute("SELECT 1 FROM users WHERE username = %s", (username,))
        if cur.fetchone():
            print(f"Usuário '{username}' já existe. Nada a fazer.")
            return

        cur.execute(
            "INSERT INTO users (username, name, password) VALUES (%s, %s, %s)",
            (username, name, password),
        )
        conn.commit()
        print("Usuário demo inserido com sucesso!")

    except Exception as e:
        # se algo deu errado depois de abrir a conexão, tenta desfazer
        if conn is not None:
            try:
                conn.rollback()
            except Exception:
                pass
        print("Erro ao inserir usuário:", e)

    finally:
        # fecha com segurança apenas se foram criados
        if cur is not None:
            try:
                cur.close()
            except Exception:
                pass
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass

if __name__ == "__main__":
    insert_user("aluno", "Aluno Exemplo", "123456")  # SEM hash, só para teste