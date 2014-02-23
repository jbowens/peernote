"""
A flask blueprint for endpoints related to the front of the
website.
"""
from flask import Blueprint

front = Blueprint('front', __name__)

# Import the endpoints.
from index import *
from faq import *
from splash import *
from email_signup import *
from drop_a_line import *
