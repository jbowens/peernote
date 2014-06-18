"""
A flask blueprint for courses and related pages
"""
from flask import Blueprint

courses = Blueprint('courses', __name__)

# Import the endpoints
from course_dashboard import *
