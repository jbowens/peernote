from flask import render_template
from app.blueprints.courses import courses
from app.decorators import login_required

"""
For now, display a temporary course dashboard page
so that Bryce can design it. This code will change upon implementation
"""
@courses.route('/dashboard', methods=['GET'])
@login_required
def show_course_dashboard():
    return render_template('courses/dashboard.html', page_title="US History")

