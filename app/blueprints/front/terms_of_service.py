from flask import render_template, g
from app.blueprints.front import front

@front.route('/terms-of-service', methods=['GET'])
def terms_of_service():
    return render_template('static/terms-of-service.html', page_title="Help Center")
