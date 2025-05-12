import os
import threading
from flask import Flask, jsonify
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

from config import DevelopmentConfig, TestingConfig, ProductionConfig

load_dotenv()
app = Flask(__name__)
CORS(app)

# Shared mutable state
state = {
    "interval": 10  # default sleep interval in seconds
}

if os.getenv('APP_ENV').lower() == 'development':
    app_settings = DevelopmentConfig
    app.config.from_object(app_settings)
elif os.getenv('APP_ENV').lower() == 'testing':
    app_settings = TestingConfig
    app.config.from_object(app_settings)
elif os.getenv('APP_ENV').lower() == 'production':
    app_settings = ProductionConfig
    app.config.from_object(app_settings)
else:
    app_settings = DevelopmentConfig
    app.config.from_object(app_settings)

bcrypt = Bcrypt(app)
db = SQLAlchemy(app)

