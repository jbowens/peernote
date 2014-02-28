from flask import render_template
from app.blueprints.admin import admin
from sqlalchemy import func
from app.models.user import User
from app.models.email import Email
from app import db

@admin.route('/', methods=['GET'])
def index():

    num_users = db.session.query(func.count(User.uid)).first()[0]
    num_beta_subscribers = db.session.query(func.count(Email.eid)).first()[0]

    return render_template('admin/index.html', num_users=num_users, num_beta_subscribers=num_beta_subscribers)
