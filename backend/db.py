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

POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))

pool = pooling.MySQLConnectionPool(
    pool_name="gym_pool",
    pool_size=POOL_SIZE,
    pool_reset_session=True,
    **DB_CONFIG
)


class ConnectionProxy:
    def __init__(self, cnx):
        self._cnx = cnx

    def cursor(self, *args, **kwargs):
        return self._cnx.cursor(*args, **kwargs)

    def commit(self):
        return self._cnx.commit()

    def rollback(self):
        return self._cnx.rollback()

    def close(self):
        try:
            if self._cnx is not None:
                # close() retorna a conexão ao pool
                self._cnx.close()
        except Exception:
            # swallow any exception during close to avoid breaking callers
            pass

    def __getattr__(self, name):
        return getattr(self._cnx, name)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        try:
            self.close()
        except Exception:
            pass

    def __del__(self):
        try:
            self.close()
        except Exception:
            pass


def get_conn():
    cnx = pool.get_connection()
    return ConnectionProxy(cnx)