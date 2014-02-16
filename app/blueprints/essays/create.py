from flask import render_template
from app.blueprints.essays import essays
from app.decorators import login_required

@essays.route('/create', methods=['GET'])
@login_required
def create_essay():
    return render_template('essays/editor.html')
