from flask import render_template
from app.blueprints.admin import admin

@admin.route('/', methods=['GET'])
def index():
    return render_template('admin/index.html')
