from flask import render_template, request, redirect, url_for, session, flash
from app.models.user import User
from app.blueprints.users import users
from app import db

@users.route('/log-in', methods=['GET','POST'])
def log_in():
    if request.method == 'POST':
        # They submitted the form and we should process it.
        
        # TODO: form validation lololololol
        user = User.query.filter_by(username=request.form.get('username', None)).first()

        if user and user.check_password(request.form.get('password', '')):
            session['uid'] = user.uid
            return redirect('/')
        flash('No user with the given username and password combination was found.')
        
    return render_template('log_in.html')
