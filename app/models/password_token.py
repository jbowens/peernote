import uuid
from datetime import datetime, timedelta
from app import db

token_life_length = timedelta(days=2)   # forty-eight hours

class PasswordToken(db.Model):
    """
    Represents a recover-your-password token.
    """
    __tablename__ = 'password_token'
    ptid = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(80), unique=True)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    email = db.Column(db.String(80))
    date_sent = db.Column(db.DateTime, default=datetime.now)
    used = db.Column(db.Boolean)

    def is_valid(self):
        return not self.used and not ((datetime.now() - self.date_sent) > token_life_length)

    @staticmethod
    def create_for_user(user):

        # Generate a hash for the token
        new_token = ''
        while not new_token:
            new_token = uuid.uuid4().hex
            queried_token = PasswordToken.query.filter_by(token=new_token).first()
            if queried_token:
                new_token = ''

        pwtoken = PasswordToken()
        pwtoken.token = new_token
        pwtoken.uid = user.uid
        pwtoken.email = user.email
        db.session.add(pwtoken)
        db.session.commit()

        return pwtoken

