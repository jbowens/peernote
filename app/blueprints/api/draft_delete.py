from flask import request, jsonify, g
from app.decorators import json_login_required, csrf_post_protected
from app.models.draft import Draft
from app.blueprints.api import api
from app import db

@api.route('/drafts/delete', methods=['POST'])
@json_login_required
@csrf_post_protected
def delete_draft():
    if 'did' in request.form:
        draft = Draft.query.filter_by(did=request.form.get('did')).first()
        if not draft:
            return jsonify(status='error', error='Invalid draft'), 404
        if essay.uid != g.user.uid:
            return jsonify(status='error', error='Unauthorized.'), 403

        db.session.delete(draft)
        db.session.commit()
        return jsonify(status='success')
    else:
        return jsonify(error="Bad params"), 400
