from flask import request, render_template, abort, g
from app.models.essay import Essay
from app.blueprints.essays import essays
from app.decorators import login_required

@essays.route('/print/<essayid>', methods=['GET'])
@login_required
def print_essay(essayid):
    essay = Essay.query.filter_by(eid=essayid).first()
    if not essay or not essay.can_view(g.user):
        abort(404)

    return render_template('essays/print.html', current_essay=essay, current_draft=essay.get_current_draft())
