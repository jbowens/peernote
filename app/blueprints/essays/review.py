from flask import render_template, redirect, url_for, abort, current_app
from app import db
from app.blueprints.essays import essays
from app.models.review import Review
from app.models.draft import Draft
from app.models.essay import Essay

@essays.route('/review/<reviewhash>', methods=['GET'])
def review_draft(reviewhash):
    review = Review.query.filter_by(urlhash=reviewhash).first()

    if not review:
        abort(404)

    current_draft = review.get_draft()
    if not current_draft:
        abort(404)

    essay = Essay.query.get(current_draft.eid)
    if not essay:
        abort(404)

    return render_template('essays/editor.html',
        current_essay=essay,
        current_draft=essay.get_current_draft(),
        reviewhash=reviewhash
    )
