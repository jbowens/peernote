#TODO someone verify that these imports are necessary, then delete this todo message
from flask import render_template, redirect, current_app, abort, g
from app.blueprints.courses import courses
from app.decorators import login_required

"""
For now, display a temporary course dashboard page
so that Bryce can design it. This code will change upon implementation
"""
@courses.route('dashboard', methods=['GET'])
@login_required
def show_course_dashboard():
    return render_template('courses/dashboard.html')

