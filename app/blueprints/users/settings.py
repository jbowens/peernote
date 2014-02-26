from flask import render_template
from app.blueprints.users import users
from app.decorators import login_required

@users.route('/settings', methods=['GET','POST'])
@login_required
def settings():
    return render_template('users/settings.html',page_title="Settings")
