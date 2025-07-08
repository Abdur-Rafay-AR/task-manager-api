from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Import models to ensure they're registered with SQLAlchemy
    from . import models

    from .routes import task_bp
    from .auth import auth_bp

    app.register_blueprint(task_bp, url_prefix="/api/tasks")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # Frontend route
    @app.route('/')
    def index():
        return render_template('index.html')

    return app
