"""
A flask blueprint for api related endpoints.
"""
from flask import Blueprint

api = Blueprint('api', __name__)

# Import the endpoints.
from save_draft import *
from snapshot import *
from email_a_review import *
from fetch_draft import *
