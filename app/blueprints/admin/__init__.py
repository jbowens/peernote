from flask import Blueprint, g, abort

admin = Blueprint('admin', __name__)

@admin.before_request
def protect_admin_pages():
    if not g.user or not g.user.is_admin:
        abort(404)

from index import *
