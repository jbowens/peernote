from app import db

class User(db.Model):
    uid = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True)

