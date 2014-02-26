from flask import request, render_template, current_app, jsonify, g
from app.blueprints.api import api
from app.models.draft import Draft
from app import db

"""
Given a draft id, responds with the drafts title and text

Expects:
did: id of draft to save
uid: id of user who owns draft

Returns:
title: title of the draft
text: text of the draft
"""
@api.route('/fetch_draft', methods=['POST'])
def fetch_draft():
    current_app.logger.debug('fetching draft')

    if g.user and 'did' in request.form and 'uid' in request.form:

        did = request.form['did']
        uid = request.form['uid']

        draft = Draft.query.filter_by(did=did).first()

        if not draft or draft.uid != g.user.uid:
            return jsonify(error='Invalid params'), 400

        return jsonify(status='success', text=draft.text, title=draft.title)
    else:
        return jsonify(error='Invalid params'), 400

