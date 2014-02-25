from app.mailer.template import MailTemplate

class RecoverPassword(MailTemplate):

    def __init__(self):
        self.body_template = 'recover_password'
