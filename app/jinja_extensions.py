from flask import g
from app import app

@app.context_processor
def inject_user_data():
    """
    Makes the user object available to all templates directly.
    """
    return dict(user=g.user, is_logged_in=g.user is not None)

