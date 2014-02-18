from flask import request, render_template, current_app, jsonify, g
from app.blueprints.api import api
from app.models.draft import Draft
from app import db

"""
Expects:
did: id of draft to save
uid: id of user who owns draft
title: new title for draft
text: new text for draft
"""
@api.route('/save_draft', methods=['POST'])
def save_draft():
    current_app.logger.debug('saving draft')

    if g.user and 'title' in request.form and 'text' in request.form and 'did' in request.form and 'uid' in request.form:

        title = request.form['title']
        text = request.form['text']
        did = request.form['did']
        uid = request.form['uid']

        draft = Draft.query.filter_by(did=did).first()

        if not draft or draft.uid != g.user.uid:
            return jsonify(success=False), 400

        draft.title = title
        draft.text = text
        db.session.add(draft)
        db.session.commit()

        return jsonify(success=True)
    else:
        return jsonify(success=False), 400
