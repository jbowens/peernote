from app import db

class Email(db.Model):
    eid = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True)
