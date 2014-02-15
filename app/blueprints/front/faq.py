from flask import render_template
from app.blueprints.front import front

@front.route('/faq', methods=['GET'])
def faq():
    return render_template('faq.html')
