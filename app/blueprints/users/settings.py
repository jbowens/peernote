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

        first_name = request.form.get('first_name')[:30]
        last_name = request.form.get('last_name')[:30]
        email = request.form.get('email')[:80]
        password = request.form.get('password')
        password_confirm = request.form.get('password_again')

        # submitted basic info
        if first_name and last_name and email:
            # No actual updates
            if email.lower() == user.email.lower() and first_name == user.first_name and last_name == user.last_name:
                flash('Information updated')

            # First name
            if first_name != user.first_name:
                user.first_name = first_name
                flash('Your first name has been updated.')

            # Last name
            if last_name != user.last_name:
                user.last_name = last_name
                flash('Your last name has been updated.')

            # Email
            if email.lower() != user.email.lower():
                if User.is_email_used(email):
                    flash('That email is already in use on the site.', 'error')
                elif not validate_email(email, check_mx=True):
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
