from flask import g, url_for, redirect, request, current_app
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user == None: 
            # This user is not logged in. Redirect them to the log in
            # page, remembering where they came from.
            return redirect(url_for('users.log_in', next=request.url))
        return f(*args, **kwargs)
    return decorated_function
