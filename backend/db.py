import os
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "root"),
    "database": os.getenv("DB_NAME", "gymLeague"),
    "charset": "utf8mb4",
    "use_pure": True,
}

pool = pooling.MySQLConnectionPool(
    pool_name="gym_pool",
    pool_size=5,
    pool_reset_session=True,
    **DB_CONFIG
)

def get_conn():
    """Obtém uma conexão do pool (lembre-se de fechar após usar)."""
    return pool.get_connection()