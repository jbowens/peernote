from flask import render_template
from app.blueprints.courses import courses
from app.decorators import login_required

"""
This route creates a new course. TODO: Post request
"""
@courses.route('/create', methods=['GET', 'POST'])
@login_required
def create_course():
    return render_template('courses/create.html', page_title='Create Course')
