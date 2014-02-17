from flask import render_template
from app.blueprints.front import front

@front.route('/splash', methods=['GET'])
def splash():
    return render_template('splash.html')
