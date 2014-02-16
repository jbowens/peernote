from flask import render_template, request, redirect, url_for, session
from app.models.user import User
from app.blueprints.users import users
from app import db

@users.route('/log-in', methods=['GET','POST'])
def log_in():
    login_failed = False
    if request.method == 'POST':
        # They submitted the form and we should process it.
        
        # TODO: form validation lololololol
        user = User.query.filter_by(username=request.form.get('username', None)).first()

        if user and user.check_password(request.form.get('password', '')):
            session['uid'] = user.uid
            return redirect('/')
        login_failed = True
        
    return render_template('log_in.html', login_failed=login_failed)
