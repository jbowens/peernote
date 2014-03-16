from flask import request, jsonify, current_app
from app.blueprints.api import api
import pprint

@api.route('/record-error', methods=['POST'])
def record_error():
    if 'message' not in request.form:
        return jsonify(status='error'), 400

    is_error = request.form.get('type') == 'error'
    serialized_data = pprint.pformat(request.form)

    if is_error:
        current_app.logger.error('[JS] %s, %s', request.form.get('message',''), serialized_data)
    else:
        current_app.logger.warning('[JS] %s, %s', request.form.get('message',''), serialized_data)

    return jsonify(status='success')
