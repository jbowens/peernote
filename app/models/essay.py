from app import db

class Essay(db.Model):
    eid = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    title = db.Column(db.String(80))
    upload_id = db.Column(db.Integer, db.ForeignKey('upload.upload_id'), nullable=True)
    text = db.Column(db.UnicodeText)

    def get_paragraphs(self):
      """
      Returns the essay text as a list of paragraphs. This is useful for setting up the
      text in the editor.
      """
      return self.text.split('\n')
