from flask import request, render_template, current_app, jsonify, g
from app.decorators import json_login_required
from app.blueprints.api import api
from app.models.draft import Draft
from app.models.essay import Essay
from app import db

"""
Given a draft id, responds with the drafts title and text

Expects:
did: id of draft to save
uid: id of user who owns draft
timestamp: (optional) only return if essay has timestamp later than this. Must come in the format str(datetime)

Returns:
title: title of the draft
text: text of the draft
timestamp: timestamp of modified date
"""

@api.route('/fetch_draft', methods=['GET'])
@json_login_required
def fetch_draft():
    current_app.logger.debug('fetching draft')

    if 'did' in request.args and 'uid' in request.args:

        did = request.args['did']
        uid = request.args['uid']

        draft = Draft.query.filter_by(did=did).first()

        essay = Essay.query.filter_by(eid=draft.eid).first()

        if not draft or draft.uid != g.user.uid:
            return jsonify(error='Invalid params'), 400

        if 'timestamp' in request.args:
            timestamp = str(request.args['timestamp'])
            if timestamp == str(essay.modified_date):
                return '', 204


        return jsonify(status='success',
            text=draft.text,
            title=draft.title,
            finalized=draft.finalized,
            modifiers=draft.modifiers,
            timestamp=str(essay.modified_date)
        )
    else:
        return jsonify(error='Invalid params'), 400

