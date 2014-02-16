from app import db

class Essay(db.Model):
    eid = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    title = db.Column(db.String(80))
    upload_id = db.Column(db.Integer, db.ForeignKey('upload.upload_id'), nullable=True)
    text = db.Column(db.UnicodeText)


