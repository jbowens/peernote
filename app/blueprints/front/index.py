from flask import render_template, g
from app.blueprints.front import front
from app.blueprints.users.profile import show_user_profile

@front.route('/', methods=['GET'])
def index():
    # If a user is logged in, render html for the user homepage. Otherwise
    # render the splash page
    if g.user == None:
        return render_template('index.html')
    else:
        return show_user_profile(g.user.username)
