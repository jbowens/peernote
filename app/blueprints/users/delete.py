from flask import redirect, g
from app.blueprints.users import users
from app.decorators import login_required, csrf_post_protected
from app.models.user import User
from app import db

@users.route('/delete', methods=['POST'])
@login_required
@csrf_post_protected
def delete_account():
    # Uid of account to delete
    uid = g.user.uid

    # Delete the user.
    db.session.delete(g.user)
    db.session.commit()
    return redirect('/')
