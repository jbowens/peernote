from flask import request, abort, current_app, g, make_response
from app.decorators import login_required
from app.models.draft import Draft
from app.blueprints.essays import essays
from app.parsers import parsers

@essays.route('/export/<draftid>/<filename>.<ext>', methods=['GET'])
@login_required
def export_essay(draftid, filename, ext):
    draft = Draft.query.filter_by(did=draftid).first()
    current_app.logger.debug("draft = %s", draft)
    if not draft or draft.uid != g.user.uid:
        abort(404)

    applicable_parsers = filter(lambda p: p.export_ext == ext, parsers)
    if len(applicable_parsers) == 0:
        current_app.logger.warning("Request to export to unsupported file extension: %s", ext)
        abort(404)

    parser = applicable_parsers[0]

    exported_file = parser.create_file(draft)
    resp = make_response(exported_file)
    resp.headers['Pragma'] = 'public'
    resp.headers['Cache-Control'] = 'private'
    resp.headers['Expires'] = '0'
    resp.headers['Content-Type'] = parser.export_mime
    resp.headers['Content-Disposition'] = 'attachment; filename=%s' % (draft.get_filename_base() + '.' + ext)
    return resp
