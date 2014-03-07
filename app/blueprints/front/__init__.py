"""
A flask blueprint for endpoints related to the front of the
website.
"""
from flask import Blueprint

front = Blueprint('front', __name__)

# Import the endpoints.
from index import *
from splash import *
from email_signup import *
from drop_a_line import *
from terms_of_service import *
from privacy_policy import *
from unsubscribe import *
from cover_captcha import *
from meet_the_team import *
