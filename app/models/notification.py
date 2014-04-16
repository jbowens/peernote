from datetime import datetime
from jinja2 import Template
from app import db
import user

class Notification(db.Model):
    nid = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.Integer, db.ForeignKey('user.uid', ondelete='cascade'), nullable=False)
    from_uid = db.Column(db.Integer, db.ForeignKey('user.uid', ondelete='cascade'))
    short_template = db.Column(db.String(80))
    url = db.Column(db.String(80))
    long_template = db.Column(db.UnicodeText)

    seen = db.Column(db.Boolean, default=False)
    created_date = db.Column(db.DateTime, default=datetime.now)

    def sender(self):
        if self.from_uid:
            sender = user.User.query.filter_by(uid=self.from_uid).first()
            if sender:
                return sender.first_name + " " + sender.last_initial()

        return "Peernote"

    def rendered_short(self):
        return Template(self.short_template).render(sender=self.sender())

    def rendered_long(self):
        return Template(self.long_template).render(sender=self.sender())

    def pretty_created_date(self):
        if self.created_date.date() == datetime.today().date():
            return 'Today'
        elif self.created_date.date() == datetime.today().date() - timedelta(days=1):
            return 'Yesterday'
        else:
            return self.created_date.strftime('%b %d')

    def to_dict(self):
        return {
            'nid': self.nid,
            'created_date': self.pretty_created_date(),
            'short_text': self.rendered_short(),
            'url': self.url,
            'long_text': self.rendered_long(),
            'seen': self.seen
        }
