from datetime import datetime
from app import db
import uuid

class UnsubscribeToken(db.Model):
    utid = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.UnicodeText, unique=True)
    email = db.Column(db.String(80))
    sent_date = db.Column(db.DateTime, default=datetime.now)
    email_type = db.Column(db.String(80))

    @staticmethod
    def create(email, email_type):
        token = ''
        while not token:
            token = uuid.uuid4().hex
            ut = UnsubscribeToken.query.filter_by(token=token).first()
            if ut is not None:
                token = ''
        
        new_token = UnsubscribeToken()
        new_token.token = token
        new_token.email = email
        new_token.email_type = email_type

        db.session.add(new_token)
        db.session.commit()
        return new_token
