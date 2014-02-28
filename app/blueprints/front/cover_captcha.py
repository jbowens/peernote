import random
from flask import Response, session
from app.blueprints.front import front
from app.app_root import APP_ROOT

@front.route('/captcha.png', methods=['GET'])
def captcha_image():

    images = [('breakfastofchampions.png','Breakfast of Champions'),
              ('songofsolomon.png', 'Song of Solomon'),
              ('tokillamockingbird.png', 'To Kill A Mockingbird'),
              ('fahrenheit451.png', 'Farenheit 451'),
              ('thegreatgatsby.png', 'The Great Gatsby')]
    img = random.choice(images)

    img_loc = APP_ROOT + '/captcha/' + img[0]

    session['captcha_title'] = img[1]

    with open(img_loc) as f:
        img_data = f.read()
        resp = Response(img_data, mimetype='image/png')
        resp.headers['Cache-Control'] = 'no-cache'
        return resp
