from app.mailer.template import MailTemplate
from email.mime.multipart import MIMEMultipart

class DropALine(MailTemplate):

    def __init__(self):
        self.body_template = 'drop_a_line'
        self.include_unsubscribe_all = False

    def render(self, to_email, from_email, bindings):
        msg = MIMEMultipart()
        msg['To'] = to_email
        msg['From'] = from_email
        msg['Subject'] = 'Peernote Feedback: ' + bindings['subject']

        self.render_body(msg, bindings)

        return msg
