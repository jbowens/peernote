from flask import render_template, g, request, url_for, redirect, current_app
from app.blueprints.essays import essays
from app.decorators import login_required
from app.models.upload import Upload
from app.models.essay import Essay
from app import db
from boto.s3.connection import S3Connection
from boto.s3.key import Key

# Set of allowed upload extensions.
ALLOWED_EXTENSIONS = set(['txt'])

@essays.route('/upload', methods=['GET','POST'])
@login_required
def upload_essay():

    if request.method == 'POST' and 'paper' in request.files:
        f = request.files['paper']
        title = request.form.get('title', None)
        if not title:
            title = f.filename

        # Create an entry in the upload table for the upload
        contents = f.read()
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
        new_essay = Essay()
        new_essay.title = title
        new_essay.uid = g.user.uid
        new_essay.upload_id = new_upload.upload_id
        new_essay.text = contents
        db.session.add(new_essay)
        db.session.commit()

        # TODO: Change redirect location.
        return redirect(url_for('front.index'))

    return render_template('essays/upload.html')
