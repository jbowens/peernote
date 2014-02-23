from flask import current_app
import smtplib, importlib

class Mailer:
  """
  Mailer class for sending emails. All email sending code should go
  through this Mailer.
  """
  smtp_host = ""
  smtp_port = 587
  smtp_user = ""
  smtp_pass = ""

  def __init__(self):
    config = current_app.config
    self.smtp_host = config.get('MANDRILL_SMTP_HOST')
    self.smtp_port = config.get('MANDRILL_SMTP_PORT')
    self.smtp_user = config.get('MANDRILL_USERNAME')
    self.smtp_pass = config.get('MANDRILL_PASSWORD')

  def send(self, template, bindings, to_email, from_email = None):

    if from_email is None:
        from_email = current_app.config['DEFAULT_FROM']

    rendering = template.render(to_email, from_email, bindings)
    self._send_raw_email(to_email, from_email, rendering)

  def _send_raw_email(self, to_email, from_email, email_string):
    s = smtplib.SMTP(self.smtp_host, self.smtp_port)
    s.login(self.smtp_user, self.smtp_pass)
    s.sendmail(from_email, to_email, email_string.as_string())
    s.quit()

