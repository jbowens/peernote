import os
from flask import render_template, g, request, url_for, redirect, current_app
from app.blueprints.essays import essays
from app.decorators import login_required
from app.models.upload import Upload
from app.models.essay import Essay
from app import db
from boto.s3.connection import S3Connection
from boto.s3.key import Key
from app.parsers import parsers

@essays.route('/upload', methods=['GET','POST'])
@login_required
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
            # TODO: Actual error page.
            return 'That file type is not supported.'

        # Read the entire file into memory.
        contents = f.read()

        # Parse the document with the appropriate parser 
        doc_parser = parsers[0]
        new_essay = doc_parser.parse_file(contents)

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

        # Create the essay entry too.
        new_essay.title = new_essay.title if new_essay.title else title
        new_essay.uid = g.user.uid
        new_essay.upload_id = new_upload.upload_id
        db.session.add(new_essay)
        db.session.commit()

        # TODO: Change redirect location.
        return redirect(url_for('front.index'))

    return render_template('essays/upload.html')
