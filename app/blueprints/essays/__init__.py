"""
A flask blueprint for essays related endpoints. 
"""
from flask import Blueprint

essays = Blueprint('essays', __name__)

# Import the endpoints.
from index import essays_index
from create import create_essay
from review import review_essay
from upload import upload_essay
