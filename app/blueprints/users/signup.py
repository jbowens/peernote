from flask import render_template, request, redirect, url_for, session, current_app, g
from app.models.user import User
from app.blueprints.users import users
from app import db

@users.route('/sign-up', methods=['GET','POST'])
def signup():
    if not g.user and request.method == 'POST':
        # They submitted the form and we should process it.
        
        # TODO: form validation lololololol

        newuser = User()
        newuser.username = request.form['username']
        newuser.email = request.form['email']
        newuser.set_password(request.form['password'])
        db.session.add(newuser)
        db.session.commit()

        # Log this user in.
        session['uid'] = newuser.uid
        current_app.logger.debug('Logging in as uid = %d', session['uid'])

        # TODO: Lots of shit

        return redirect('/')
        
    return render_template('signup.html')
