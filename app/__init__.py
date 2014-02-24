from flask import Flask, g, request, render_template, session
from flask.ext.assets import Environment, Bundle
from flask.ext.sqlalchemy import SQLAlchemy
from getpass import getuser
from os import environ

# Set up the flask application.
app = Flask(__name__)
app.debug = True
app.config.from_pyfile('../config/default.cfg')
if environ.get('REMOTE_DB'):
    app.config.from_pyfile('../config/remote_db.cfg')
if getuser() == 'peernote':
    app.config.from_pyfile('../config/production.cfg')

# bundles for css
import bundles

# add our jinja extensions
from jinja_extensions import *
from decorators import *

# Gimmie some databi
db = SQLAlchemy(app)

# Import the models
from app.models.user import User
from app.models.essay import Essay
from app.models.upload import Upload
from app.models.draft import Draft
from app.models.email import Email

# Setup all the blueprints
from blueprints.front import front
from blueprints.users import users
from blueprints.essays import essays
from blueprints.reviews import reviews
from blueprints.api import api

app.register_blueprint(front)
app.register_blueprint(users)
app.register_blueprint(essays, url_prefix='/essays')
app.register_blueprint(reviews, url_prefix='/reviews')
app.register_blueprint(api, url_prefix='/api')

# Sometime before the first request we need to create all of the
# database tables.
@app.before_first_request
def initialize_database():
    if environ.get('RESET_DB'):
        app.logger.debug('RECREATING ALL DATABASE TABLES')
        db.drop_all()
    db.create_all()

@app.before_request
def process_session():
    g.user = None
    if session.get('uid', None): 
        # This user is logged in. Grab the user object.
        cur_user = User.query.filter_by(uid=session['uid']).first()
        if not cur_user:
            # This user was deleted during his/her session. Kill the session.
            session.pop('uid', None)
        else:
            # Save the user object in the global object
            g.user = cur_user
            app.logger.debug('Request authenticated as (%d, %s)', g.user.uid, g.user.email)

if __name__ == '__main__':
    db.drop_all()
