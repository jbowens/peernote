from app import db

class Review(db.Model):
    rid = db.Column(db.Integer, primary_key=True)
    did = db.Column(db.Integer, db.ForeignKey('draft.did'), nullable=False)
    urlhash = db.Column(db.String(80), nullable=False, unique=True)
