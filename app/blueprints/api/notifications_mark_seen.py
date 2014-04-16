from flask import request, current_app, jsonify, g
from app.decorators import json_login_required
from app.blueprints.api import api
from app.models.notification import Notification
from app import db

"""
Expects:
ids: List of ids of logged in user's notifications to mark as seen.
"""
@api.route('/notifications/seen', methods=['POST'])
@json_login_required
def mark_seen_notifications():
    current_app.logger.debug('marking notifications as seen')

    ids = request.form.getlist('ids[]')
    if ids:
        to_mark = Notification.query.filter(Notification.nid.in_(ids)).all()
        for n in to_mark:
            if n.uid == g.user.uid:
                n.seen = True
                db.session.add(n)
            else:
                return jsonify(status='error', error='Unauthorized.'), 403

        db.session.commit()
        return jsonify(error="success")
    else:
        return jsonify(error="Bad params"), 400
