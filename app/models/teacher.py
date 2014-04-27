from app import db

class Teacher(db.Model):
    tid = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid', ondelete='cascade'), nullable=False)
    school = db.Column(db.String(80))
