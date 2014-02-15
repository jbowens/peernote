from flask.ext.assets import Environment, Bundle
from app import app

assets = Environment(app)

base_css = Bundle(
    "scss/bootstrap.scss",
    "scss/reset.scss",
    "scss/top_nav.scss",
    filters="scss,cssmin",
    output="gen/base.css",
)

home_css = Bundle(
    "scss/home.scss",
    filters="scss,cssmin",
    output="gen/home.css",
)

assets.register('base_css', base_css)
assets.register('home_css', home_css)
