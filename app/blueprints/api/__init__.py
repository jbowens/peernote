"""
A flask blueprint for api related endpoints.
"""
from flask import Blueprint

api = Blueprint('api', __name__)

# Import the endpoints.
from save_draft import *
from email_a_review import *
from fetch_draft import *
from draft_delete import *
from users_essays_get import *
from users_notifications_get import *
from notifications_mark_seen import *
from next_draft import *
from essays_delete import *
from error import *
