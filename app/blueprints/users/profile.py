from flask import render_template, redirect, current_app, abort
from app.models.user import User
from app.blueprints.users import users
from app.decorators import login_required

@users.route('/users/<keyword>', methods=['GET','POST'])
def show_user_profile(keyword):
    user = User.query.filter_by(url_keyword=keyword).first()

    if not user:
        abort(404)

    return render_template('users/profile.html', viewed_user=user, page_title="Dashboard",nav_extra="dashboard")
