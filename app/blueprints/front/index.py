from flask import render_template
from app.blueprints.front import front

@front.route('/', methods=['GET'])
def index():
    return render_template('index.html')
