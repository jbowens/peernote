from flask import request, render_template, current_app, jsonify, g
from app.decorators import json_login_required
from app.blueprints.api import api
from app.models.essay import Essay
from app import db

"""
Given a user id, responds with all of the users drafts, sorted by
last modified date.

Expects:
uid: id of user

Returns:
essays: prettified json representation of essay
"""

@api.route('/users/essays', methods=['GET'])
@json_login_required
def get_user_essays():
    current_app.logger.debug('getting logged in users essays')
    essays_json = []
    essays = Essay.query.filter_by(uid=g.user.uid).order_by(Essay.modified_date.desc())
    for essay in essays:
        essays_json.append(essay.to_dict())

    return jsonify(status='success', essays=essays_json)
