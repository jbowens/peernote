from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    uid = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True)
    first_name = db.Column(db.String(30))
    last_name = db.Column(db.String(30))
    password = db.Column(db.String(128))
    may_email = db.Column(db.Boolean)
    is_admin = db.Column(db.Boolean)

    def __init__(self):
        self.may_email = True
        self.is_admin = False

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

    def last_initial(self):
        """
        Returns the first letter of the user's last name.
        """
        return self.last_name[0]

    @staticmethod
    def is_email_used(email):
        user = User.query.filter_by(email=email).first()
        return user is not None
