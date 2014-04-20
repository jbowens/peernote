from datetime import datetime
from flask import request, render_template, current_app, jsonify, g
from app.decorators import json_login_required
from app.blueprints.api import api
from app.models.draft import Draft
from app.models.essay import Essay
from app import db

"""
Given a draft, saves it to the db.

Expects:
did: id of draft to save
uid: id of user who owns draft
body: new json blob for the body of the draft
"""
@api.route('/save_draft', methods=['POST'])
@json_login_required
def save_draft():
    if 'body' in request.form and 'did' in request.form and 'uid' in request.form:

        body = request.form['body']
        did = request.form['did']
        uid = request.form['uid']

        draft = Draft.query.filter_by(did=did).first()

        if not draft or draft.uid != g.user.uid or draft.finalized:
            return jsonify(error='Invalid params'), 400

        new_did = None
        new_date = datetime.now()

        draft.body = body
        draft.modified_date = new_date
        db.session.add(draft)
        db.session.flush()

        Essay.query.filter_by(eid=draft.eid).update({'modified_date': new_date})
        db.session.commit()

        return jsonify(status='success',
            did=new_did,
            timestamp=str(new_date),
            pretty_timestamp=draft.pretty_modified_date()
        )
    else:
        return jsonify(error='Invalid params'), 400
