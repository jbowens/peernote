from flask import render_template, request, redirect, url_for, session, current_app, g
from flask_wtf import Form
from wtforms import TextField, PasswordField
from wtforms.validators import *
from wtforms.validators import ValidationError
from app.models.user import User
from app.blueprints.users import users
from app import db

def email_uniqueness(form, field):
    user = User.query.filter_by(email=field.data).first()
    if user:
        raise ValidationError('That email is already registered.')

def username_uniqueness(form, field):
    user = User.query.filter_by(username=field.data).first()
    if user:
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
    form = SignUpForm()
    if not g.user and form.validate_on_submit():
        # Create the user in the database
        newuser = User()
        newuser.username = request.form['username']
        newuser.email = request.form['email']
        newuser.set_password(request.form['pw'])
        db.session.add(newuser)
        db.session.commit()

        # Log this user in.
        session['uid'] = newuser.uid
        current_app.logger.debug('Logging in as uid = %d', session['uid'])
        return redirect('/')
        
    return render_template('users/signup.html', form=form)
