import random, json
from flask import Response, session, current_app
from app.blueprints.front import front
from app.app_root import APP_ROOT

@front.route('/captcha.png', methods=['GET'])
def captcha_image():

    listing = APP_ROOT + '/captcha/listing.json'
    all_images = []
    with open(listing) as f:
        all_images = json.load(f)
    images = all_images.items()

    img = random.choice(images)
    img_loc = APP_ROOT + '/captcha/' + img[0]
    session['captcha_title'] = img[1]

    with open(img_loc) as f:
        img_data = f.read()
        resp = Response(img_data, mimetype='image/png')
        resp.headers['Cache-Control'] = 'no-cache'
        return resp
