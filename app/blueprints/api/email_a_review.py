from flask import request, current_app, jsonify, g
from app.blueprints.api import api
from app.models.draft import Draft
from app.models.review import Review
from app import app
from app import db
import uuid
from validate_email import validate_email
from app.mailer import Mailer
from app.mailer.templates.review_a_draft import ReviewADraft
from app.decorators import json_login_required

"""
Given a draft, sends it to an email for review.
If the draft is unfinalized, finalizes it and returns
back the new draft id and version number.

Expects:
email: address of email to send to
did: id of draft to review
uid: id of user who owns draft

"""
@api.route('/email_a_review', methods=['POST'])
@json_login_required
def email_a_review():
    current_app.logger.debug('emailing review for a draft')

    if 'did' in request.form and 'uid' in request.form and 'email' in request.form:

        did = request.form['did']
        uid = request.form['uid']
        email = request.form['email']

        draft = Draft.query.filter_by(did=did).first()

        if not draft or draft.uid != g.user.uid:
            return jsonify(error="Invalid draft"), 400

        if not validate_email(email, check_mx=True):
            return jsonify(error="Invalid email"), 400

        # create review pointing to the draft
        review = Review()
        review.did = draft.did
        review.email = email

        # really good code to generate a unique url hash for the review
        unique_hash = False
        gen_hash = ''
        while not unique_hash:
            gen_hash = uuid.uuid4().hex
            queried_review = Review.query.filter_by(urlhash=gen_hash).first()
            if not queried_review:
                unique_hash = True

        review.urlhash = gen_hash

        db.session.add(review)

        # if the draft was not finalized, finalize it and create a new one
        new_did = None
        new_version = None
        if not draft.finalized:
            draft.finalized = True
            db.session.add(draft)
            db.session.flush()

            # make a new draft for the writer
            new_draft = Draft.next_draft(draft)
            db.session.add(new_draft)
            db.session.commit()
            new_did = new_draft.did
            new_version = new_draft.version
        else:
            db.session.commit()

        # send emailz
        params = {
            'sender': g.user.first_name + ' ' + g.user.last_name,
            'review_url': 'http://' + app.config.get('SERVER_HOST') + '/reviews/' + review.urlhash
        }
        mailer = Mailer()
        mailer.send(ReviewADraft(), params, email)

        return jsonify(status='success', new_did=new_did, new_version=new_version)
    else:
        return jsonify(error="Bad params"), 400
