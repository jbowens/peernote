from app import db

class Upload(db.Model):
    """
    Stores data about files uploaded to the system.
    """
    uploadid = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    mime_type = db.Column(db.String(80))
    filename = db.Column(db.String(100))
