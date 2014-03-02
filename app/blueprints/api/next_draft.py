from flask import request, current_app, jsonify, g
from app.blueprints.api import api
from app.models.draft import Draft
from app import app
from app import db

"""
Given an unfinalized draft, finalizes it and creates a new draft.
Returns the id of the new draft.

Expects:
did: id of draft to review
uid: id of user who owns draft

Returns:
did: id of new draft
version: version of new draft
"""
@api.route('/next_draft', methods=['POST'])
def next_draft():
    current_app.logger.debug('creating next draft')

    if g.user and 'did' in request.form and 'uid' in request.form:

        did = request.form['did']
        uid = request.form['uid']

        draft = Draft.query.filter_by(did=did).first()

        if not draft or draft.uid != g.user.uid or draft.finalized:
            return jsonify(error="Bad params"), 400

        # finalize the draft
        draft.finalized = True
        db.session.add(draft)
        db.session.flush()

        # make a new draft for the writer
        new_draft = Draft.next_draft(draft)
        db.session.add(new_draft)
        db.session.commit()

        return jsonify(status='success', did=new_draft.did, version=new_draft.version)
    else:
        return jsonify(error="Bad params"), 400
