from flask import render_template, redirect, current_app, abort
from app.models.user import User
from app.blueprints.users import users
from app.decorators import login_required

@users.route('/users/<uid>', methods=['GET','POST'])
def show_user_profile(uid):
    user = User.query.filter_by(uid=uid).first()

    if not user:
        abort(404)

    return render_template('users/profile.html', viewed_user=user, page_title="Dashboard",nav_extra="dashboard")
