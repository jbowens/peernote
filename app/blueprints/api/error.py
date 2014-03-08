from flask import request, jsonify, current_app
from app.blueprints.api import api
import pprint

@api.route('/record-error', methods=['POST'])
def record_error():
    if 'message' not in request.form:
        return jsonify(status='error'), 400

    error_type = 'error' if request.form.get('type') == 'error' else 'warning'

    if error_type == 'error':
        current_app.logger.error('[JS] %s, %s', request.form.get('message'), pprint.pformat(request.form))
    else:
        current_app.logger.warning('[JS] %s, %s', request.form.get('message'), pprint.pformat(request.form))

    return jsonify(status='yay')
