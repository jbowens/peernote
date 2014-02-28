from flask import render_template, request, redirect, url_for, session, current_app, g, flash
from flask_wtf import Form
from wtforms import TextField, PasswordField
from wtforms.validators import *
from wtforms.validators import ValidationError
from app.models.user import User
from app.blueprints.users import users
from app.mailer.templates.welcome import Welcome
from app.mailer import Mailer
from app import db

def email_uniqueness(form, field):
    if User.is_email_used(field.data.lower()):
        raise ValidationError('That email is already registered.')

def username_uniqueness(form, field):
    if User.is_username_used(field.data):
        raise ValidationError('That username is already registered.')

class SignUpForm(Form):
    username = TextField('username', validators=[DataRequired(),
                                                 Length(max=30),
                                                 username_uniqueness])
    email = TextField('email', validators=[DataRequired(), Email(), email_uniqueness])
    pw = PasswordField('pw', validators=[DataRequired()])
    pw_again = PasswordField('pw_again', validators=[DataRequired(), EqualTo('pw')])

@users.route('/sign-up', methods=['GET','POST'])
def signup():
    
    if g.user:
        return redirect('/')

    form = SignUpForm()

    # Check the captcha
    captcha_passed = False
    if request.method == 'POST':
        if request.form.get('cover','').lower() == session.get('captcha_title').lower():
            captcha_passed = True
        else:
            flash('The text in the image did not match.', 'error')

    if request.method == 'POST' and form.validate_on_submit() and captcha_passed:
        # Create the user in the database
        newuser = User()
        newuser.username = request.form['username']
        newuser.email = request.form['email'].lower()
        newuser.set_password(request.form['pw'])
        db.session.add(newuser)
        db.session.commit()

        # Send the welcome email.
        mailer = Mailer()
        params = {
            'subject': 'Welcome to Peernote',
            'user': newuser
        }
        mailer.send(Welcome(), params, newuser.email)

        # Log this user in.
        session['uid'] = newuser.uid
        current_app.logger.debug('Logging in as uid = %d', session['uid'])
        return redirect('/')
        
    return render_template('users/signup.html', form=form)
