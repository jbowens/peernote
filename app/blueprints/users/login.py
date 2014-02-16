from flask import render_template, request, redirect, url_for, session, flash
from app.models.user import User
from app.blueprints.users import users
from app import db

@users.route('/log-in', methods=['GET','POST'])
def log_in():
    if request.method == 'POST':
        # They submitted the form and we should process it.
        user = User.query.filter_by(username=request.form.get('username', None)).first()

        if user and user.check_password(request.form.get('password', '')):
            session['uid'] = user.uid
            next_location = request.form.get('next_location')
            return redirect(next_location if next_location else url_for('front.index'))
        flash('No user with the given username and password combination was found.')

    return render_template('users/log_in.html', next_location=request.args.get('next'))
