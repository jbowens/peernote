from werkzeug.security import generate_password_hash
from app import db

class User(db.Model):
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30))
    email = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(128))

    def set_password(self, password):
        """
        Takes a plaintext password and generates a salted hash.
        """
        self.password = generate_password_hash(password)
        return self.password
