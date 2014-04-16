from flask import request, render_template, current_app, jsonify, g
from app.decorators import json_login_required
from app.blueprints.api import api
from app.models.notification import Notification
from app import db

"""
Responds with the logged in users notifications, sorted by
last modified date.

Expects:
count: number to return

Returns:
essays: prettified json representation of essay
"""
@api.route('/users/notifications', methods=['GET'])
@json_login_required
def get_notifications():
    if 'count' in request.args:
        current_app.logger.debug('getting logged in users notifications')

        notifications_json = []
        notifications = Notifications.query.filter_by(uid=g.user.uid).order_by(Notifications.modified_date.desc()).limit(request.args['count'])

        for notification in notifications:
            notifications_json.append(notification.to_dict())

        return jsonify(status='success', notifications=notifications_json)

    else:
        return jsonify(error='Invalid params'), 400
