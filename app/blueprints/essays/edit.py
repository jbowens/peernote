from flask import request, render_template, redirect, url_for, g
from app.blueprints.essays import essays
from app.models.essay import Essay
from app.decorators import login_required

@essays.route('/edit/<essayid>', methods=['GET'])
@login_required
def edit_essay(essayid):
    essay = Essay.query.filter_by(eid=essayid).first()
    if essay and g.user.uid == essay.uid:
        return render_template('essays/editor.html', current_essay=essay)
    else:
        return redirect(url_for('essays.essays_index'))
