from app.mailer.template import MailTemplate
from email.mime.multipart import MIMEMultipart

class BetaSignupConfirmation(MailTemplate):

  def __init__(self):
    self.body_template = 'beta_signup_confirmation'
    self.unsubscribe_type = 'beta'

  def render(self, to_email, from_email, bindings):
    msg = MIMEMultipart()
    msg['To'] = to_email
    msg['From'] = from_email 
    msg['Subject'] = 'Welcome to Peernote!'

    self.render_body(msg, bindings)
    
    return msg


