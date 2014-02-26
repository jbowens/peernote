from flask import render_template, g
from app.blueprints.front import front
from app.blueprints.users.profile import show_user_profile

@front.route('/terms-of-service', methods=['GET'])
def terms_of_service():
    return render_template('static/terms-of-service.html', page_title="Help Center")
