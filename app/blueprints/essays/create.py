from flask import request, render_template
from app.blueprints.essays import essays
from app.decorators import login_required

@essays.route('/write', methods=['GET','POST'])
@login_required
def create_essay():
    if request.method == 'GET':
        return render_template('essays/create.html')
    else:
        return "FUCK POSTS"
