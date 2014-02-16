from flask import request, render_template, current_app, jsonify, g
from app.blueprints.essays import essays
from app.decorators import login_required

@essays.route('/write', methods=['GET'])
@login_required
def create_essay():
    return render_template('essays/create.html')
