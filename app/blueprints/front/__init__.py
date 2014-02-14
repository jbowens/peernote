"""
A flask blueprint for endpoints related to the front of the
website.
"""
from flask import Blueprint

front = Blueprint('front', __name__)

# Import the endpoints.
from index import *
