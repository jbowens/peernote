import random, json
from PIL import Image
from cStringIO import StringIO
from flask import Response, session, current_app, send_file
from app.blueprints.front import front
from app.app_root import APP_ROOT
from app.captcha.distortions import SineWarp

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

    imgobj = Image.open(img_loc)
    operation = random.randint(0,1)
    if operation == 0:
        # Grayscale the image
        imgobj = imgobj.convert('L')

    # Now perform a distortion
    warp = SineWarp()
    imgobj = warp.render(imgobj)

    img_io = StringIO()
    imgobj.save(img_io, 'png')
    img_io.seek(0)
    resp = Response(img_io.read(), mimetype='image/png')
    resp.headers['Cache-Control'] = 'no-cache'
    return resp
