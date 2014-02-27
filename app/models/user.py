from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True)
    email = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(128))
    may_email = db.Column(db.Boolean)

    def __init__(self):
        self.may_email = True

    def set_password(self, password):
        """
        Takes a plaintext password and generates a salted hash.
        """
        self.password = generate_password_hash(password)
        return self.password

    def check_password(self, password):
        """
        Takes a plaintext password and verifies that it matches 
        the stored hash.
        """
        return check_password_hash(self.password, password)

    @staticmethod
    def is_email_used(email):
        user = User.query.filter_by(email=email).first()
        return user is not None

    @staticmethod
    def is_username_used(username):
        user = User.query.filter_by(username=username).first()
        return user is not None
