from app.essays import essays

@essays.route('/review/<int:essay_id>')
def review_essay(essay_id):
    return 'Review a fucking essay (specifically essay id ' + str(essay_id) + ')'
