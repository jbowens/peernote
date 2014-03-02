from datetime import datetime
from app import db

class Snapshot(db.Model):
    sid = db.Column(db.Integer, primary_key=True)
    did = db.Column(db.Integer, db.ForeignKey('draft.did'), nullable=False)
    eid = db.Column(db.Integer, db.ForeignKey('essay.eid'), nullable=False)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    title = db.Column(db.UnicodeText)
    text = db.Column(db.UnicodeText)
    time_taken = db.Column(db.DateTime,default=datetime.now)
    taken_automatically = db.Column(db.Boolean, default=True)

    def __init__(self, draft):
        self.did = draft.did
        self.eid = draft.eid
        self.uid = draft.uid
