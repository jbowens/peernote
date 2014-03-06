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
    current_app.logger.debug('getting user essays')

    if 'uid' in request.args:
        uid = int(request.args['uid'])
        if uid != g.user.uid:
            return jsonify(status='error', error='Unauthorized.'), 403

        essays_json = []
        essays = Essay.query.filter_by(uid=uid).order_by(Essay.modified_date.desc())
        for essay in essays:
            essay_json = {
                'eid': essay.eid,
                'created_date': essay.pretty_created_date(),
                'modified_date': essay.pretty_modified_date(),
                'created_date': essay.pretty_created_date(),
                'version': essay.get_current_draft().version
            }
            essays_json.append(essay_json)

        return jsonify(status='success', essays=essays_json)
    else:
        return jsonify(error='Invalid params'), 400


