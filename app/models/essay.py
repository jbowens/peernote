from datetime import datetime
from app import db
from draft import Draft

class Essay(db.Model):
    eid = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid'), nullable=False)
    upload_id = db.Column(db.Integer, db.ForeignKey('upload.upload_id'), nullable=True)
    deleted = db.Column(db.Boolean, default=False)
    created_date = db.Column(db.DateTime, default=datetime.now)

    def get_paragraphs(self):
      """
      Returns the essay text as a list of paragraphs. This is useful for setting up the
      text in the editor.
      """
      return self.get_current_draft().get_paragraphs()

    def can_view(self, user):
        """
        Returns a boolean determining whether the given user can view this essay. This
        checks ownership as well as whether or not the essay has been deleted.
        """
        return not self.deleted and user.uid == self.uid

    def get_current_draft(self):
        """
        Returns draft with the highest draft number associated with
        this essay
        """
        draft = Draft.query.filter_by(eid=self.eid).order_by(Draft.version.desc()).first()
        return draft

    def get_all_drafts(self):
        drafts = Draft.query.filter_by(eid=self.eid).order_by(Draft.version.asc())
        return drafts

