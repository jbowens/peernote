from flask import g, url_for, redirect, request, current_app, abort
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

def csrf_post_protected(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'POST' and request.form.get('csrf') != g.csrf_token:
            return abort(400)
        return f(*args, **kwargs)
    return decorated_function
