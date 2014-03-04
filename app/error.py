from flask import render_template
from app import app

@app.errorhandler(404)
def page_not_found(e):
    return render_template('static/error404.html'), 404

@app.errorhandler(500)
def error_500(e):
    return render_template('static/error500.html'), 500

@app.route('/oops', methods=['GET'])
def oops():
    return render_template('static/oops.html')
