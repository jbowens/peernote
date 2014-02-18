from app import db

class Draft(db.Model):
    did = db.Column(db.Integer, primary_key=True)
    eid = db.Column(db.Integer, db.ForeignKey('essay.eid'), nullable=False)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    version = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(80))
    text = db.Column(db.UnicodeText)

    def __init__(self):
        self.version = 1

    def get_paragraphs(self):
      """
      Returns the drafts text as a list of paragraphs. This is useful for
      setting up the text in the editor.
      """
      return self.text.split('\n')
