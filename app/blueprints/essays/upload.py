import os, json
from datetime import datetime
from flask import render_template, g, request, url_for, redirect, current_app, flash
from app.blueprints.essays import essays
from app.decorators import login_required, csrf_post_protected
from app.models.upload import Upload
from app.models.essay import Essay
from app.models.draft import Draft
from app import db
from boto.s3.connection import S3Connection
from boto.s3.key import Key
from app.parsers import parsers

@essays.route('/upload', methods=['GET','POST'])
@login_required
@csrf_post_protected
def upload_essay():

    if request.method == 'POST' and 'paper' in request.files:
        f = request.files['paper']
        title = request.form.get('title', None)
        if not title:
            title = f.filename

        file_name, file_extension = os.path.splitext(f.filename)
        file_extension = file_extension[1::]
        applicable_parsers = filter(lambda p: p.accepts_extension(file_extension), parsers)
        if len(applicable_parsers) == 0:
            flash('Invalid file format provided')
            return render_upload(parsers)

        # Read the entire file into memory.
        contents = f.read()
        f.seek(0)

        # Parse the document with the appropriate parser
        doc_parser = applicable_parsers[0]
        parsed_contents = doc_parser.parse_file(f.stream)

        # Create an entry in the upload table for the upload
        new_upload = Upload()
        new_upload.uid = g.user.uid
        new_upload.size = len(contents)
        new_upload.mimetype = f.mimetype
        new_upload.filename = f.filename
        db.session.add(new_upload)
        db.session.flush()

        # Save the file to s3
        conn = S3Connection(current_app.config['AWS_ACCESS_KEY'],
                            current_app.config['AWS_SECRET_KEY'])
        bucket = conn.get_bucket(current_app.config['UPLOADS_S3_BUCKET'])
        k = Key(bucket)
        k.key = str(new_upload.upload_id) + '-' + f.filename
        k.set_contents_from_string(contents)

        # create a single datetime object so both draft and essay have the
        # same instead of being slightly different
        now = datetime.now()

        # Create the essay entry
        new_essay = Essay()
        new_essay.uid = g.user.uid
        new_essay.upload_id = new_upload.upload_id
        new_essay.created_date = now
        new_essay.modified_date = now
        db.session.add(new_essay)
        db.session.flush()

        # Create draft associated with essay
        draft = Draft()
        draft.eid = new_essay.eid
        draft.uid = g.user.uid
        draft.created_date = now
        draft.modified_date = now
        draft.title = parsed_contents.title if title in parsed_contents else title
        paragraphs = parsed_contents['text'].split('\n')
        body = {'blockid': 1, 'type': 'container', 'children': []}
        blockid = 1
        for p in paragraphs:
            body['children'].append({'blockid': blockid + 1, 'type': 'text', 'text': p, 'modifiers': []})
            blockid = blockid + 1
        body['max_blockid'] = blockid
        draft.body = json.dumps(body)
        db.session.add(draft)
        db.session.commit()

        return redirect(url_for('essays.edit_essay', essayid=new_essay.eid))

    return render_upload(parsers)


def render_upload(parsers):
    accepted_extensions = set([])
    for parser in parsers:
        for ext in parser.get_file_extensions():
            accepted_extensions.add(ext)

    return render_template('essays/upload.html', accepted_extensions=', '.join(list(accepted_extensions)))
