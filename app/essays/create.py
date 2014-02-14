from app.essays import essays

@essays.route('/write', methods=['GET','POST'])
def create_essay():
    return 'Write a fucking essay'
