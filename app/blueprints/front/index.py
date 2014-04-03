from flask import render_template, g, current_app
from app.blueprints.front import front
from app.blueprints.users.profile import show_user_profile
from app.blueprints.front.splash import splash

@front.route('/', methods=['GET'])
def index():
    # If a user is logged in, render html for the user homepage. Otherwise
    # render the splash page
    if g.user == None:
        return splash()
    else:
        return show_user_profile()
