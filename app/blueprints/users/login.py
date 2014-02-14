from flask import render_template, request, redirect, url_for
from app.models.user import User
from app.blueprints.users import users
from app import db

@users.route('/log-in', methods=['GET','POST'])
def log_in():
    if request.method == 'POST':
        # They submitted the form and we should process it.
        
        # TODO: form validation lololololol

        # TODO: Lots of shit

        return redirect('/')
        
    return render_template('log_in.html')
