from flask import g
from flaskext.gravatar import Gravatar
from app import app

@app.context_processor
def inject_user_data():
    """
    Makes the user object available to all templates directly.
    """
    return dict(user=g.user, is_logged_in=g.user is not None)

gravatar = Gravatar(app,
                    size=100,
                    rating='g',
                    default='retro',
                    force_default=False,
                    use_ssl=False,
                    base_url=None)

