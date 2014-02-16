from app import db

class Upload(db.Model):
    """
    Stores data about files uploaded to the system.
    """
    upload_id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    mimetype = db.Column(db.String(80))
    filename = db.Column(db.String(100))
