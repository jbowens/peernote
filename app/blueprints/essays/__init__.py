"""
A flask blueprint for essays related endpoints. 
"""
from flask import Blueprint

essays = Blueprint('essays', __name__)

# Import the endpoints.
from create import create_essay
from review import review_essay
