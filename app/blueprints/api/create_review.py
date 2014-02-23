from flask import request, render_template, current_app, jsonify, g
from app.blueprints.api import api
from app.models.draft import Draft
from app.models.review import Review
from app import db
import uuid

"""
Given a draft, creates a review for the draft.

Expects:
did: id of draft to review
uid: id of user who owns draft

Returns:
urlhash: hash that points to reviewer
did: id of new draft for writer

"""
@api.route('/create_review', methods=['POST'])
def create_review():
    current_app.logger.debug('creating review for a draft')

    if g.user and 'did' in request.form and 'uid' in request.form:

        did = request.form['did']
        uid = request.form['uid']

        draft = Draft.query.filter_by(did=did).first()

        if not draft or draft.uid != g.user.uid or draft.finalized:
            return jsonify(success=False), 400

        # finalize current draft
        draft.finalized = True
        db.session.add(draft)
        db.session.flush()

        # create a new draft for the writer
        new_draft = Draft.next_draft(draft)
        db.session.add(new_draft)
        db.session.flush()

        # create review
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

        return jsonify(success=True, urlhash=review.urlhash, did=new_draft.did)
    else:
        return jsonify(success=False), 400
