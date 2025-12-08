import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from routes.auth import auth_bp
from routes.users import users_bp
from routes.rotina_routes import rotinas_bp
from routes.exercicios_routes import exercicios_bp
from routes.grupos_routes import grupos_bp
from routes.musculos_routes import musculos_bp
from routes.inserirExercicio import inserirExercicios_bp
from routes.explorarRotinas import explorarRotinas_bp
from routes.treinar_routes import treinar_bp
from routes.ranking import ranking_bp
from routes.evolucao_routes import evolucao_bp
from routes.editar import editar_bp
from routes.metas import metas_bp
from routes.home_routes import home_bp

load_dotenv()

FRONT_ORIGIN = os.getenv("FRONT_ORIGIN", "http://localhost:5173")

app = Flask(__name__)
CORS(app, origins=[FRONT_ORIGIN])

# registra blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(rotinas_bp)
app.register_blueprint(exercicios_bp)
app.register_blueprint(grupos_bp)
app.register_blueprint(musculos_bp)
app.register_blueprint(inserirExercicios_bp)
app.register_blueprint(explorarRotinas_bp)
app.register_blueprint(treinar_bp)
app.register_blueprint(ranking_bp)
app.register_blueprint(evolucao_bp)
app.register_blueprint(editar_bp)
app.register_blueprint(metas_bp)
app.register_blueprint(home_bp)

@app.get("/health")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    port = int(os.getenv("FLASK_RUN_PORT", 5000))
    debug = bool(int(os.getenv("FLASK_DEBUG", "1")))
    app.run(host="0.0.0.0", port=port, debug=debug)
