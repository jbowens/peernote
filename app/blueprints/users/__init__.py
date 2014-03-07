"""
A flask blueprint for users related endpoints. 
"""
from flask import Blueprint

users = Blueprint('users', __name__)

# Import the endpoints.
from signup import *
from login import *
from logout import *
from settings import *
from profile import *
from forgot_password import *
from delete import *
