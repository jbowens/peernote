from datetime import datetime
from sqlalchemy import event
import random
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from review import Review
from essay import Essay
from draft import Draft

def titlecase_name_hook(mapper, connect, target):
    target.titlecase_name_hook()

class User(db.Model):
    uid = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True)
    url_keyword = db.Column(db.String(80), unique=True)
    first_name = db.Column(db.String(30))
    last_name = db.Column(db.String(30))
    password = db.Column(db.String(128))
    may_email = db.Column(db.Boolean)
    is_admin = db.Column(db.Boolean)
    signup_date = db.Column(db.DateTime, default=datetime.now)
    teacher = db.relationship('Teacher', uselist=False, backref='user')

    def __init__(self):
        self.may_email = True
        self.is_admin = False

    def set_password(self, password):
        """
        Takes a plaintext password and generates a salted hash.
        """
        self.password = generate_password_hash(password)
        return self.password

    def check_password(self, password):
        """
        Takes a plaintext password and verifies that it matches
        the stored hash.
        """
        return check_password_hash(self.password, password)

    def last_initial(self):
        """
        Returns the first letter of the user's last name.
        """
        return self.last_name[0]

    def get_assigned_reviews(self, count):
        """
        Returns count number of most recently assigned reviews to user's
        email address.
        """
        return Review.query.filter_by(email=self.email).order_by(Review.created_date.desc()).limit(count)

    def essay_count(self):
        return Essay.query.filter_by(uid=self.uid).count()

    def draft_count(self):
        return Draft.query.filter_by(uid=self.uid).count()

    def is_teacher(self):
        return self.teacher is not None

    def titlecase_name_hook(self):
        if self.first_name:
            self.first_name = self.first_name.title()
        if self.last_name:
            self.last_name = self.last_name.title()

    @staticmethod
    def generate_url_keyword(first_name, last_name):
        first_name = first_name.lower()
        last_name = last_name.lower()

        base = first_name + '-' + last_name[0]

        def is_taken(keyword):
            return User.query.filter_by(url_keyword=keyword).first() is not None

        if not is_taken(base):
            return base

        hash_len = 4
        hash_range = 16 ** hash_len - (16 ** (hash_len - 1))
        i = random.randint(0, hash_range) + (16 ** (hash_len - 1))
        while is_taken(hex(i)[2:] + '-' + base):
            i = random.randint(0, hash_range) + (16 ** (hash_len - 1))

        return hex(i)[2:] + '-' + base

    @staticmethod
    def is_email_used(email):
        user = User.query.filter_by(email=email).first()
        return user is not None


event.listen(User, 'before_insert', titlecase_name_hook)
event.listen(User, 'before_update', titlecase_name_hook)
