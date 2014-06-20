"""
A flask blueprent for assignments and related pages
"""
from flask import Blueprint

assignments = Blueprint('assignments', __name__)

#Import the endpoints
from create import *
