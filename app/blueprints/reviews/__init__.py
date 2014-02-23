"""
A flask blueprint for essays related endpoints.
"""
from flask import Blueprint

reviews = Blueprint('reviews', __name__)

# Import the endpoints.
from reviewer import review_draft
