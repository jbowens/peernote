from flask import request, render_template, g
from app.decorators import login_required
from app.blueprints.essays import essays
from app.models.essay import Essay

@essays.route('/')
@login_required
def essays_index():
    essays = Essay.query.filter_by(uid=g.user.uid).all()
    return render_template('essays/index.html', essays=essays, page_title="Documents")
