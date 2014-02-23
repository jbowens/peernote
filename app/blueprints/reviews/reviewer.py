from flask import render_template, redirect, url_for
from app import db
from app.blueprints.reviews import reviews
from app.models.review import Review
from app.models.draft import Draft

@reviews.route('/<reviewhash>', methods=['GET'])
def review_draft(reviewhash):
    review = Review.query.filter_by(urlhash=reviewhash).first()
    if review:
        current_draft = Draft.query.filter_by(did=review.did).first()
        if current_draft:
            return render_template('reviews/reviewer.html', current_draft=current_draft)

    return redirect(url_for('essays.essays_index')) # TODO: something else
