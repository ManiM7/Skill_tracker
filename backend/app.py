from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.tasks import tasks_bp

app = Flask(__name__)

# allow frontend (React) to call this backend (different port)
CORS(app)

# register the auth blueprint
app.register_blueprint(auth_bp)
app.register_blueprint(tasks_bp)

@app.route("/")
def health():
    return "Backend is running"

if __name__ == "__main__":
    app.run(debug=True)
