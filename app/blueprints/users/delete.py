from flask import redirect, g
from app.blueprints.users import users
from app.decorators import login_required, csrf_post_protected
from app.models.user import User
from app.models.draft import Draft
from app.models.essay import Essay
from app.models.upload import Upload
from app.models.password_token import PasswordToken
from app import db

@users.route('/delete', methods=['POST'])
@login_required
@csrf_post_protected
def delete_account():
    # Uid of account to delete
    uid = g.user.uid

    # Delete everything referencing this user.
    Draft.query.filter_by(uid=uid).delete()
    Essay.query.filter_by(uid=uid).delete()
    Upload.query.filter_by(uid=uid).delete()
    PasswordToken.query.filter_by(uid=uid).delete()

    # Delete the user.
    db.session.delete(g.user)
    db.session.commit()
    return redirect('/')
