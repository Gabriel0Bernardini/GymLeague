import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from routes.auth import auth_bp
from routes.users import users_bp
from routes.rotina_routes import rotinas_bp

load_dotenv()

FRONT_ORIGIN = os.getenv("FRONT_ORIGIN", "http://localhost:5173")

app = Flask(__name__)
CORS(app, origins=[FRONT_ORIGIN])

# registra blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(rotinas_bp)

@app.get("/health")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    port = int(os.getenv("FLASK_RUN_PORT", 5000))
    debug = bool(int(os.getenv("FLASK_DEBUG", "1")))
    app.run(host="0.0.0.0", port=port, debug=debug)
