from flask import current_app
from app import db
import json

class Draft(db.Model):
    did = db.Column(db.Integer, primary_key=True)
    eid = db.Column(db.Integer, db.ForeignKey('essay.eid', ondelete='cascade'), nullable=False)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid', ondelete='cascade'), nullable=False)
    version = db.Column(db.Integer, nullable=False, default=1)
    title = db.Column(db.String(80))
    text = db.Column(db.UnicodeText)
    modifiers = db.Column(db.UnicodeText, default=None)
    finalized = db.Column(db.Boolean, default=False)

    def get_paragraphs(self):
        """
        Returns the drafts text as a list of paragraphs. This is useful for
        setting up the text in the editor.
        """
        return self.text.split('\n')

    def get_filename_base(self):
        """
        Returns a copy of the title that could be used as the base
        of a filename.
        """
        title = self.title if self.title else 'Untitled'
        return ''.join(ch for ch in title if ch.isalnum())

    def get_modifiers(self):
        """
        Retrieves all the modifiers contained in the essay.
        """
        if not self.modifiers:
          return []

        try:
          return json.dumps(self.modifiers)
        except ValueError:
          # The modifiers column wasn't valid JSON.
          current_app.logger.warning("Draft modifiers not valid JSON: %s", self.modifiers)
          return []

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
