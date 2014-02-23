from flask import render_template
from email.mime.text import MIMEText
from html2text import html2text

class MailTemplate:

  body_template = None

  def __init__(self):
    pass

  def render(self, bindings = dict()):
    raise NotImplementedError()

  def render_body_template(self, bindings = dict(), template=None):
    if template == None:
      template = 'email/' + self.body_template + '.html'
   
    html_body = render_template(template, **bindings)
    return html_body

  def render_body(self, msg, bindings = dict(), template = None):
    body = self.render_body_template(bindings, template)
   
    text_part = MIMEText(html2text(body), 'text')
    html_part = MIMEText(body, 'html')
    msg.attach(text_part)
    msg.attach(html_part)
