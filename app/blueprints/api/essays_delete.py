from flask import request, jsonify, g
from app.decorators import json_login_required, csrf_post_protected
from app.models.essay import Essay
from app.blueprints.api import api
from app import db

@api.route('/essays/delete', methods=['POST'])
@json_login_required
@csrf_post_protected
def delete_essay():
    # Find the essay to delete and verify that the request is valid. 
    essay = Essay.query.filter_by(eid=request.form.get('eid')).first()
    if not essay:
        return jsonify(status='error', error='Invalid essay'), 404
    if essay.uid != g.user.uid:
        return jsonify(status='error', error='Unauthorized.'), 403

    db.session.delete(essay)
    db.session.commit()
    return jsonify(status='success')
