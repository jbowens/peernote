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

# Setup all the blueprints
from users import users
from essays import essays
app.register_blueprint(users)
app.register_blueprint(essays, url_prefix='/essays')

# Sometime before the first request we need to create all of the
# database tables.
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
