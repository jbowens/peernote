from flask import render_template
from app.blueprints.assignments import assignments
from app.decorators import login_required

"""
This route creates a new assignment
"""
@assignments.route('/create', methods=['POST'])
@login_required
def create_assignment():
    pass #TODO
