from flask import request, jsonify
from app.models.email import Email
from app.blueprints.front import front

@front.route('/email-signup', methods=['POST'])
def email_signup():
    email = request.form.get('email') 
    if not email:
        return jsonify(error='no email', status='error')

    email_db_obj = Email()
    email_db_obj.email = request.form.get('email')
    db.session.add(email_db_obj)
    db.session.commit()
    return jsonify(status='ok')
      
