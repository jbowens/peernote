from flask import request, redirect, g, session
from app.blueprints.users import users

@users.route('/log-out', methods=['GET'])
def log_out():
    if session.get('uid', None):
        session.pop('uid', None)
    return redirect('/')
