from app import db

class Draft(db.Model):
    did = db.Column(db.Integer, primary_key=True)
    eid = db.Column(db.Integer, db.ForeignKey('essay.eid'), nullable=False)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    version = db.Column(db.Integer, nullable=False, default=1)
    title = db.Column(db.String(80))
    text = db.Column(db.UnicodeText)
    finalized = db.Column(db.Boolean, default=False)

    def get_paragraphs(self):
      """
      Returns the drafts text as a list of paragraphs. This is useful for
      setting up the text in the editor.
      """
      return self.text.split('\n')


    @classmethod
    def next_draft(cls, draft):
        """
        Copies a draft, increments version number, and returns new one
        """
        new_draft = Draft()
        new_draft.eid = draft.eid
        new_draft.uid = draft.uid
        new_draft.version = draft.version + 1
        new_draft.title = draft.title
        new_draft.text = draft.text

        return new_draft
