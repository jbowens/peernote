from app.users import users

@users.route('/sign-up', methods=['GET','POST'])
def signup():
    return 'Sign the fuck up'
