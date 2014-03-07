from flask import render_template, redirect, url_for, abort, current_app
from app import db
from app.blueprints.reviews import reviews
from app.models.review import Review
from app.models.draft import Draft
from app.models.essay import Essay

@reviews.route('/<reviewhash>', methods=['GET'])
def review_draft(reviewhash):
    review = Review.query.filter_by(urlhash=reviewhash).first()

    if not review:
        abort(404)

    draft = review.get_draft()
    if not draft:
        abort(404)

    essay = Essay.query.get(draft.eid)
    if not essay:
        abort(404)

    return render_template('reviews/reviewer.html', current_draft=draft)
