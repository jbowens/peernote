from flask import render_template, g
from app.blueprints.front import front

@front.route('/meet-the-team', methods=['GET'])
def meet_the_team():
    return render_template('static/meet-the-team.html', page_title="Meet the Team")
