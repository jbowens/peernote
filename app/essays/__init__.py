"""
A flask blueprint for essays related endpoints. 
"""
from flask import Blueprint

essays = Blueprint('essays', __name__)

# Import the endpoints.
from app.essays.create import *
