from flask import request, jsonify, g
from app.decorators import json_login_required
from app.blueprints.api import api
from app.models.snapshot import Snapshot
from app.models.draft import Draft
from app import db

"""
CURRENTLY UNUSED
"""
@api.route('/snapshot', methods=['POST'])
@json_login_required
def save_snapshot():
   
    draft = Draft.query.filter_by(did=request.form.get('did')).first()
    if not draft or draft.uid != g.user.uid:
        return jsonify(status='error', error='That draft does not exist.'), 404
    if draft.finalized:
        return jsonify(status='error', error='That draft is finalized.'), 400

    if 'title' not in request.form or 'text' not in request.form:
        return jsonify(stauts='error', error='Essay state not included in request.'), 400

    snapshot = Snapshot(draft)
    snapshot.title = request.form['title']
    snapshot.text = request.form['text']
    snapshot.taken_automatically = request.form.get('auto') != 'false'
    db.session.add(snapshot)
    db.session.commit()
    
    return jsonify(status='success', sid=snapshot.sid)
