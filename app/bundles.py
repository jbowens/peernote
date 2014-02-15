from flask.ext.assets import Environment, Bundle
from app import app

assets = Environment(app)

assets.register('base_css',
    Bundle(
        "scss/bootstrap.scss",
        "scss/reset.scss",
        "scss/shared/*.scss",
        filters="scss,cssmin",
        output="gen/base.css",
    )
)

assets.register('home_css',
    Bundle(
        "scss/home.scss",
        filters="scss,cssmin",
        output="gen/home.css",
    )
)
