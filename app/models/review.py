from datetime import datetime
from draft import Draft
from app import db

class Review(db.Model):
    rid = db.Column(db.Integer, primary_key=True)
    did = db.Column(db.Integer, db.ForeignKey('draft.did', ondelete='cascade'), nullable=False)
    urlhash = db.Column(db.String(80), nullable=False, unique=True)
    created_date = db.Column(db.DateTime, default=datetime.now)
    email = db.Column(db.String(80))

    def get_draft(self):
        return Draft.query.filter_by(did=self.did).first()
