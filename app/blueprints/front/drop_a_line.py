from flask import request, jsonify
from app.blueprints.front import front
from app.mailer.templates.drop_a_line import DropALine
from app.mailer import Mailer

@front.route('/drop-a-line', methods=['POST'])
def drop_a_line():
  expected_fields = ['name', 'email', 'subject', 'message']

  missing_fields = []
  for field in expected_fields:
    if field not in request.form:
      missing_fields.append(field)

  if missing_fields:
    return jsonify(status='error', missing_fields=missing_fields, error='missing fields'), 400

  mailer = Mailer()
  from_email = request.form['name'] + '<' + request.form['email'] + '>'
  params = {
    'name': request.form['name'],
    'email': request.form['email'],
    'subject': request.form['subject'],
    'message': request.form['message']
  }
  mailer.send(DropALine(), params, 'bryaebi@gmail.com', from_email)

  return jsonify(status='success')
