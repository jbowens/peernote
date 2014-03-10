from sqlalchemy import exc
from sqlalchemy import event
from sqlalchemy.pool import Pool
from flask import Flask, g, request, render_template, session, redirect, url_for
from flask.ext.assets import Environment, Bundle
from flask.ext.sqlalchemy import SQLAlchemy
from os import environ
import os, uuid, socket, logging

# Set up the flask application.
app = Flask(__name__)

app.config.from_pyfile('../config/default.cfg')
if environ.get('REMOTE_DB'):
    app.config.from_pyfile('../config/remote_db.cfg')

hostname = socket.gethostname()
machine_config_file = 'config/' + hostname + '.cfg'
if os.path.exists(machine_config_file):
    app.logger.debug('Loading custom config file for ' + hostname)
    app.config.from_pyfile('../' + machine_config_file)

if not app.config.get('DEBUG'):
    # If we're not in debug mode, only output warning events and above.
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.WARNING)

if app.config.get('LOG_FILE'):
    # If a log file is specified, setup a log file to store warnings
    # and errors.
    file_handler = logging.FileHandler(app.config.get('LOG_FILE'))
    file_handler.setLevel(logging.WARNING)
    file_handler.setFormatter(logging.Formatter(
        '[%(levelname)s] [%(module)s] %(filename)s + %(lineno)d\t'
        '%(asctime)s\t'
        '%(message)s\n'
    ))
    app.logger.addHandler(file_handler)

# set webassets env debug value so we dont minify in dev
Environment.debug = app.debug

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
from app.models.password_token import PasswordToken
from app.models.snapshot import Snapshot

# Setup all the blueprints
from blueprints.front import front
from blueprints.users import users
from blueprints.essays import essays
from blueprints.reviews import reviews
from blueprints.api import api
from blueprints.admin import admin
from error import *

app.register_blueprint(front)
if not app.config.get('IS_PRODUCTION'):
    app.register_blueprint(users)
    app.register_blueprint(essays, url_prefix='/essays')
    app.register_blueprint(reviews, url_prefix='/reviews')
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(admin, url_prefix='/admin')

if app.config.get('IS_PRODUCTION'):
    @app.route('/<path:path>', methods=['GET'])
    def catchall(path):
        return redirect(url_for('front.index'))

# Be careful about connections that might have gone stale.
@event.listens_for(Pool, "checkout")
def ping_connection(dbapi_connection, connection_record, connection_proxy):
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("SELECT 1")
    except:
        # optional - dispose the whole pool
        # instead of invalidating one at a time
        # connection_proxy._pool.dispose()

        # raise DisconnectionError - pool will try
        # connecting again up to three times before raising.
        raise exc.DisconnectionError()
    cursor.close()


@app.before_request
def process_session():
    if not session.get('csrf'):
        session['csrf'] = uuid.uuid4().hex
    g.csrf_token = session['csrf']

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
