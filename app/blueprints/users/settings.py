from flask import render_template, request, g, flash
from app.blueprints.users import users
from app.decorators import login_required, csrf_post_protected
from app.models.user import User
from validate_email import validate_email
from app import db

@users.route('/settings', methods=['GET','POST'])
@login_required
@csrf_post_protected
def settings():
    if request.method == 'POST':
        # They submitted the form. Let's update some shit!
        user = g.user

        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        password_confirm = request.form.get('password_again')

        # Username
        if username and username.lower() != user.username.lower():
            if User.is_username_used(username):
                flash('That username is already taken.', 'error')
            else:
                user.username = username
                flash('Your username has been updated.')

        # Email
        if email and email.lower() != user.email.lower():
            if User.is_email_used(email):
                flash('That email is already in use on the site.', 'error')
            elif not validate_email(email):
                flash('That is not a valid email address', 'error')
            else:
                user.email = email
                flash('Your email address has been updated.')
        
        # Password
        if password:
            if password != password_confirm:
                flash('Provided passwords don\'t match.', 'error')
            else:
                user.set_password(password)
                flash('Your password has been updated.')

        db.session.commit()
            
    return render_template('users/settings.html',page_title="Settings")
