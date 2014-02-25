from flask import render_template, request, flash, abort, g, current_app
from app.blueprints.users import users
from app.models.user import User
from app.models.password_token import PasswordToken
from app.mailer.templates.recover_password import RecoverPassword
from app.mailer import Mailer
from app import db
from validate_email import validate_email

@users.route('/forgot-password/<string:token_hash>', methods=['GET', 'POST'])
def reset_password(token_hash):

    if g.user:
        # Shouldn't be logged in.
        abort(404)

    token = PasswordToken.query.filter_by(token=token_hash).first()
    if not token or not token.is_valid():
        abort(404)
    user = User.query.filter_by(uid=token.uid).first()
    if not user:
        abort(404)

    password_reset = False

    if request.method == 'POST' and request.form.get('password') and request.form.get('password_again'):
        if request.form.get('password') != request.form.get('password'):
            flash('Passwords do not match.')
        else:
            user.set_password(request.form.get('password'))
            token.used = True
            db.session.commit()
            password_reset = True

    return render_template('users/reset_password.html', password_reset=password_reset)

@users.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    
    if g.user:
        # Shouldn't be logged in.
        abort(404)

    email_sent = False
    user_to_recover = None

    if request.method == 'POST' and request.form.get('user_to_recover'): 
        
        uinput = request.form.get('user_to_recover')
        username = None

        if validate_email(uinput):
            # They entered an email. Get the user obj by the email.
            user_to_recover = User.query.filter_by(email=uinput).first() 
        else:
            # They entered a username. Get the user obj by the username.
            user_to_recover = User.query.filter_by(username=uinput).first()

        if user_to_recover:
            # Generate a password recovery token for the user.
            token = PasswordToken.create_for_user(user_to_recover)
            # Send an email.
            mailer = Mailer()
            params = {
                'subject': 'Recover your password',
                'token': token,
                'user_to_recover': user_to_recover
            };
            mailer.send(RecoverPassword(), params, user_to_recover.email)
            email_sent = True
        else:
            # No such user exists. Print an error.
            flash('No user exists with the given ' + ('email address' if email else 'username') + '.')

    return render_template('users/forgot_password.html', email_sent=email_sent, user_to_recover=user_to_recover)
