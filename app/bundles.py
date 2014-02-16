from flask.ext.assets import Environment, Bundle
from app import app

assets = Environment(app)

assets.register('base_css',
    Bundle(
        "scss/reset.scss",
        "scss/bootstrap.scss",
        "scss/top_nav.scss",
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

assets.register('essays_css',
    Bundle(
        "scss/essays.scss",
        filters="scss, cssmin",
        output="gen/essays.css"
    )
)
