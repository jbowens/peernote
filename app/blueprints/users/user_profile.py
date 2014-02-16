from flask import render_template, redirect
from app.models.user import User
from app.blueprints.users import users
from app.decorators import login_required

@users.route('/users/<name>', methods=['GET','POST'])
def show_user_profile(name):
    user = User.query.filter_by(username=name).first()
    if user:
        return render_template('users/profile.html', viewed_user=name)
    else:
        return "USER DONT EXIST"
