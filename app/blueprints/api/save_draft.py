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
title: new title for draft
text: new text for draft
"""
@api.route('/save_draft', methods=['POST'])
@json_login_required
def save_draft():
    current_app.logger.debug('saving draft')

    if g.user and 'title' in request.form and 'text' in request.form and 'did' in request.form and 'uid' in request.form:

        title = request.form['title']
        text = request.form['text']
        did = request.form['did']
        uid = request.form['uid']

        draft = Draft.query.filter_by(did=did).first()

        if not draft or draft.uid != g.user.uid or draft.finalized:
            return jsonify(error='Invalid params'), 400

        new_did = None
        if not draft.finalized:
            draft.title = title
            draft.text = text
            db.session.add(draft)
            db.session.commit()
        else:
            new_draft = Draft.next_draft(draft)
            new_draft.title = title
            new_draft.text = text
            db.session.add(new_draft)
            db.session.commit()
            new_did = new_draft.did

        # Update the last modified time.
        Essay.query.filter_by(eid=draft.eid).update({'modified_date': datetime.now()})
        db.session.commit()

        return jsonify(status='success', did=new_did)
    else:
        return jsonify(error='Invalid params'), 400
