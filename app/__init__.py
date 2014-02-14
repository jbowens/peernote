from flask import Flask, g, request, render_template
from flask.ext.assets import Environment, Bundle
from flask.ext.sqlalchemy import SQLAlchemy

# Set up the flask application.
app = Flask(__name__)
app.debug = True
assets = Environment(app)

common_css = Bundle(
    "scss/*.scss", "scss/bootstrap/*.scss",
    filters="scss,cssmin",
    output="gen/dist.css",
)

assets.register('common_css', common_css)
app.config.from_pyfile('../config/default.cfg')

# Gimmie some databi
db = SQLAlchemy(app)

from app.models import *

@app.route('/')
def index():
    return render_template('index.html')
