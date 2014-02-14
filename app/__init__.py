from flask import Flask, g, request, render_template
from flask.ext.assets import Environment, Bundle
from flask.ext.sqlalchemy import SQLAlchemy

# Set up the flask application.
app = Flask(__name__)
app.debug = True
app.config.from_pyfile('../config/default.cfg')
assets = Environment(app)

common_css = Bundle(
    "scss/*.scss", "scss/bootstrap/*.scss",
    filters="scss,cssmin",
    output="gen/dist.css",
)

assets.register('common_css', common_css)

# Gimmie some databi
db = SQLAlchemy(app)

# Import the models
from app.models.user import User

@app.before_first_request
def initialize_database():
    if app.debug:
        db.drop_all()
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    db.drop_all()
