from datetime import datetime
from flask import request, render_template, current_app, jsonify, g
from app.decorators import json_login_required
from app.blueprints.api import api
from app.models.notification import Notification
from app import db

"""
Responds with the logged in users notifications, sorted by last modified
date, oldest first.

Expects:
count: number to return
timestamp: (optional) only return notifications with a epoch/unix time in seconds later than this

Returns:
notifications: json representation of notifications
"""
@api.route('/users/notifications', methods=['GET'])
@json_login_required
def get_notifications():
    if 'count' in request.args:
        current_app.logger.debug('getting logged in users notifications')

        if 'timestamp' in request.args:
            timestamp = request.args['timestamp']
            if timestamp.isdigit():
                timestamp = float(timestamp)
                notifications = Notification.query.filter(Notification.uid == g.user.uid, Notification.created_date > datetime.fromtimestamp(timestamp))
            else:
                return jsonify(error='Invalid timestamp'), 400
        else:
            notifications = Notification.query.filter_by(uid=g.user.uid)

        notifications = notifications.order_by(Notification.created_date.desc()).limit(request.args['count'])


        notifications_json = []
        for notification in notifications:
            notifications_json.append(notification.to_dict())

        #flip so we return oldest first
        notifications_json.reverse()


        return jsonify(status='success', notifications=notifications_json)

    else:
        return jsonify(error='Invalid params'), 400
