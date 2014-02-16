from flask import render_template, g
from app.blueprints.front import front

@front.route('/', methods=['GET'])
def index():
    # If a user is logged in, render html for the user homepage. Otherwise
    # render the splash page
    if g.user == None:
        return render_template('index.html')
    else:
        return render_template('users/profile.html', viewed_user=g.user.username)
