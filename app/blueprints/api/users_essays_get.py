from flask import request, render_template, current_app, jsonify, g
from app.decorators import json_login_required
from app.blueprints.api import api
from app.models.essay import Essay
from app import db

"""
Responds with all of the logged in users drafts, sorted by
last modified date.

Returns:
essays: prettified json representation of essay
"""

@api.route('/users/essays', methods=['GET'])
@json_login_required
def get_user_essays():
    current_app.logger.debug('getting logged in users essays')
    essays_json = []

    essays = Essay.query.filter_by(uid=g.user.uid).all()
    essays = sorted(essays, key=lambda essay: essay.modified_date(), reverse=True)

    for essay in essays:
        essays_json.append(essay.to_dict())

    return jsonify(status='success', essays=essays_json)
