import json
from datetime import datetime
from flask import render_template, redirect, url_for, g
from app import db
from app.blueprints.essays import essays
from app.models.essay import Essay
from app.models.draft import Draft
from app.decorators import login_required

@essays.route('/create', methods=['GET'])
@login_required
def create_essay():
    # create a single datetime object so both draft and essay have the same
    # instead of being slightly different
    now = datetime.now()

    # construct a new essay and redirect to it
    essay = Essay()
    essay.uid = g.user.uid
    essay.upload_id = None
    essay.created_date = now
    essay.modified_date = now
    db.session.add(essay)
    db.session.flush()

    # construct an initial draft for the essay
    draft = Draft()
    draft.eid = essay.eid
    draft.uid = g.user.uid
    draft.created_date = now
    draft.modified_date = now

    draft.body = Draft.default_body()
    draft.title = ""
    db.session.add(draft)
    db.session.commit()

    return redirect(url_for('essays.edit_essay', essayid=essay.eid))
