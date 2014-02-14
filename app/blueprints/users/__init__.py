"""
A flask blueprint for users related endpoints. 
"""
from flask import Blueprint

users = Blueprint('users', __name__)

# Import the endpoints.
from signup import *
from login import *
