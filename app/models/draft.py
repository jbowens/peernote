from datetime import datetime
from flask import current_app
from app import db
import json

class Draft(db.Model):
    did = db.Column(db.Integer, primary_key=True)
    eid = db.Column(db.Integer, db.ForeignKey('essay.eid', ondelete='cascade'), nullable=False)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid', ondelete='cascade'), nullable=False)
    version = db.Column(db.Integer, nullable=False, default=1)
    title = db.Column(db.String(80))
    body = db.Column(db.UnicodeText)
    finalized = db.Column(db.Boolean, default=False)
    created_date = db.Column(db.DateTime, default=datetime.now)
    modified_date = db.Column(db.DateTime, default=datetime.now)

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

    def pretty_modified_date(self):
        if not self.modified_date:
            return ""

        if self.modified_date.date() == datetime.today().date():
            return self.modified_date.strftime('%I:%M %p')
        else:
            return self.modified_date.strftime('%b %d')

    @classmethod
    def default_body(cls, text = None):
        """
        Returns a json string that is the default body for new essays/drafts.
        """
        text = text if text else ''
        body = {
          'max_blockid': 2,
          'type': 'container',
          'blockid': 1,
          'children': [{
              'type': 'text',
              'blockid': 2,
              'text': text,
              'modifiers': []
            }]
        }
        return json.dumps(body)

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
        new_draft.body = draft.body

        return new_draft
