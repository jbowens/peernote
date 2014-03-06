"""
A flask blueprint for api related endpoints.
"""
from flask import Blueprint

api = Blueprint('api', __name__)

# Import the endpoints.
from save_draft import *
from email_a_review import *
from fetch_draft import *
from users_essays_get import *
from next_draft import *
from essays_delete import *

