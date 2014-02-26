from flask import render_template, session
from app.blueprints.front import front

@front.route('/splash', methods=['GET'])
def splash():
    has_signed_up = session.get('splash_email_signed_up')
    return render_template('static/splash.html', has_signed_up=has_signed_up)
