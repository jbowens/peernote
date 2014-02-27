from flask import request, abort, render_template, current_app
from app.blueprints.front import front
from app.models.unsubscribe_token import UnsubscribeToken
from app.models.user import User
from app.models.email import Email
from app import db

@front.route('/unsubscribe/<string:raw_token>', methods=['GET'])
def unsubscribe(raw_token):
    token = UnsubscribeToken.query.filter_by(token=raw_token).first()
    if not token:
        abort(404)

    all_emails = False
    if token.email_type == 'all': 
        # This is a request to unsubscribe from ALL emails. Turn off
        # all emails for the user with this email address.
        all_emails = True
        u = User.query.filter_by(email=token.email).first()
        if u:
            u.may_email = False
            db.session.commit()

    if token.email_type == 'beta' or all_emails:
        # They're attempting to unsubscribe from the beta emails. Delete
        # the row in the emails table.
        Email.query.filter_by(email=token.email).delete()
        db.session.commit()
    elif not all_emails:
        # We don't recognize that subscription type. 
        current_app.logger.error('Unsubscription request with unknown subscription type "%s"', token.email_type)
        # TODO: Improve error message.
        abort(500)

    # Everything is good. Print a nice, friendly success message.
    return render_template('front/unsubscribe.html', email=token.email, all_emails=all_emails)
