from app.mailer.template import MailTemplate

class Welcome(MailTemplate):
    
    def __init__(self):
        self.body_template = 'welcome'
