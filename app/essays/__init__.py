"""
A flask blueprint for essays related endpoints. 
"""
from flask import Blueprint

essays = Blueprint('essays', __name__)

# Import the endpoints.
from app.essays.create import create_essay
from app.essays.review import review_essay
