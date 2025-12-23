from flask import Flask, jsonify
from flask_cors import CORS     #Allow frontend to call backend API
from controllers.user_controller import user_bp
from controllers.task_controller import task_bp
from controllers.skill_controller import skill_bp
from common.exceptions import ValidationError, AuthError, NotFoundError, ForbiddenError
import traceback

app = Flask(__name__)
CORS(app)

app.register_blueprint(user_bp)
app.register_blueprint(task_bp)
app.register_blueprint(skill_bp)

@app.route("/")
def health():
    return "Skill Tracker Backend (MVC + JWT) Running"

 
# ----- Global error handling -----
@app.errorhandler(ValidationError)
def handle_validation(err):
    return jsonify({"error": str(err)}), 400

@app.errorhandler(AuthError)
def handle_auth(err):
    return jsonify({"error": str(err)}), 401

@app.errorhandler(NotFoundError)
def handle_not_found(err):
    return jsonify({"error": str(err)}), 404

@app.errorhandler(ForbiddenError)
def handle_forbidden(err):
    return jsonify({"error": str(err)}), 403


@app.errorhandler(Exception)
def handle_generic(err):
    # 🔴 IMPORTANT: print full stack trace in terminal
    print("========== BACKEND CRASH ==========")
    print(err)
    traceback.print_exc()
    print("===================================")

    # send error text for now so we can debug
    return jsonify({"error": str(err)}), 500
# ----------------------------------


if __name__ == "__main__":
    app.run(debug=True)
