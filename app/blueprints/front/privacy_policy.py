from flask import render_template, g
from app.blueprints.front import front

@front.route('/privacy-policy', methods=['GET'])
def privacy_policy():
    return render_template('static/privacy-policy.html', page_title="Help Center")
