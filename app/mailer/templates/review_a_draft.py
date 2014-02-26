from app.mailer.template import MailTemplate
from email.mime.multipart import MIMEMultipart

class ReviewADraft(MailTemplate):

  def __init__(self):
    self.body_template = 'review_a_draft'

  def render(self, to_email, from_email, bindings):
    msg = MIMEMultipart()
    msg['To'] = to_email
    msg['From'] = from_email
    msg['Subject'] = 'Review a friend\'s draft on Peernote'

    self.render_body(msg, bindings)
    
    return msg
