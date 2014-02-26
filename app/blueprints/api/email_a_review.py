from flask import request, current_app, jsonify, g
from app.blueprints.api import api
from app.models.draft import Draft
from app.models.review import Review
from app import db
import uuid
from validate_email import validate_email
from app.mailer import Mailer
from app.mailer.templates.review_a_draft import ReviewADraft

"""
Given a draft, sends it to an email for review. Also finalizes the draft.

Expects:
email: address of email to send to
did: id of draft to review
uid: id of user who owns draft

Returns:
urlhash: hash for /reviews/<urlhash>
"""

@api.route('/email_a_review', methods=['POST'])
def email_a_review():
    current_app.logger.debug('emailing review for a draft')

    if g.user and 'did' in request.form and 'uid' in request.form and 'email' in request.form:

        did = request.form['did']
        uid = request.form['uid']
        email = request.form['email']

        draft = Draft.query.filter_by(did=did).first()

        if not draft or draft.uid != g.user.uid:
            return jsonify(error="Bad params"), 400

        if not validate_email(email):
            return jsonify(error="Invalid email"), 400

        # finalize the draft
        draft.finalized = True
        db.session.add(draft)
        db.session.flush()

        # create review pointing to the draft
        review = Review()
        review.did = draft.did

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
        db.session.commit()

        # send emailz
        params = {
            'sender': g.user.username,
            'review_url': 'www.peernote.me/reviews/' + review.urlhash
        }
        mailer = Mailer()
        mailer.send(ReviewADraft(), params, email)
        return jsonify(status='success')
    else:
        return jsonify(error="Bad params"), 400
