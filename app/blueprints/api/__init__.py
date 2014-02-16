"""
A flask blueprint for api related endpoints.
"""
from flask import Blueprint

api = Blueprint('api', __name__)

# Import the endpoints.
from save_essay import *
