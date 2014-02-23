from Flask import request, jsonify
from app.blueprints.front import front

@front.route('/drop-a-line', methods=['POST'])
def drop_a_line():
  expected_fields = ['name', 'email', 'subject', 'message']

  missing_fields = []
  for field in exepcted_fields:
    if not request.form.get(field):
      missing_fields.push(field)

  if missing_fields:
    return jsonify(status='error', 'missing_fields'=missing_fields, 'error'='missing fields'), 400

  # TODO: Send email

  return jsonify(status='success')
