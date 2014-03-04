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

    draft = Draft.query.filter_by(did=review.did).first()
    if not draft:
        # This should never happen. We don't actually delete the drafts from the database.
        current_app.logger.error('Reviewer had valid review hash for nonexistent draft.')
        abort(404)

    essay = Essay.query.get(draft.eid)
    if essay.deleted:
        # TODO: Make this error page prettier.
        return 'Sorry, that essay has been deleted.'

    return render_template('reviews/reviewer.html', current_draft=draft)
