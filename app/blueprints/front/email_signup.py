from flask import request, jsonify, session
from app.models.email import Email
from app.blueprints.front import front
from app.mailer.templates.beta_signup_confirmation import BetaSignupConfirmation
from validate_email import validate_email
from app.mailer import Mailer
from app import db

@front.route('/email-signup', methods=['POST'])
def email_signup():
    email = request.form.get('email').lower()
    if not email:
        return jsonify(error='no email', status='error')

    if not validate_email(email, check_mx=True):
        return jsonify(error='not a valid email', status='error')

    email_db_obj = Email.query.filter_by(email=email).first()
    if email_db_obj:
        # This email is already subscribed.
        return jsonify(error='already subscribed', status='error')

    email_db_obj = Email()
    email_db_obj.email = request.form.get('email')
    db.session.add(email_db_obj)
    db.session.commit()

    session['splash_email_signed_up'] = True

    # Send a confirmation email to the user
    mailer = Mailer()
    mailer.send(BetaSignupConfirmation(), dict(), email)

    return jsonify(status='ok')
      
