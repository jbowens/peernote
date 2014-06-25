from flask import render_template, redirect, current_app, abort, g
from app.models.user import User
from app.models.essay import Essay
from app.blueprints.users import users
from app.decorators import login_required

"""
For now, the only profile you can view is your own when logged in.
"""
@users.route('/users/profile', methods=['GET'])
@login_required
def show_user_profile():
    essays = Essay.query.filter_by(uid=g.user.uid).all()
    essays = sorted(essays, key=lambda essay: essay.modified_date(), reverse=True)[:7]
    user_is_teacher = g.user.is_teacher()

    return render_template('users/dashboard.html',
        recent_essays = essays,
        page_title = "Dashboard",
        nav_extra = "dashboard",
        is_teacher = user_is_teacher
    )
