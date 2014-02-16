from flask import request, render_template, current_app, jsonify, g
from app.blueprints.api import api
from app.models.essay import Essay
from app import db

@api.route('/save_essay', methods=['POST'])
def save_essay():
    current_app.logger.debug('saving essay')

    if g.user and 'title' in request.form and 'text' in request.form:
        if 'eid' in request.form: # preexisting essay
            essay = Essay.query.filter_by(eid=request.form.get('eid', None)).first()
            if not essay or essay.uid != g.user.uid:
                return jsonify(success=False), 400
        else: # new essay
            essay = Essay()
            essay.uid = g.user.uid

        essay.title = request.form['title']
        essay.text = request.form['text']
        db.session.add(essay)
        db.session.commit()

        return jsonify(success=True, eid=essay.eid)
    else:
        return jsonify(success=False), 400
