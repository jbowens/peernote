from flask.ext.assets import Environment, Bundle
from app import app

assets = Environment(app)

assets.register('base_css',
    Bundle(
        "scss/reset.scss",
        "scss/bootstrap.scss",
        "scss/top_nav.scss",
        "scss/shared/_footer.scss",
        "scss/shared/_base.scss",
        "scss/errors.scss",
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
        "scss/essays_print.scss",
        filters="scss,cssmin",
        output="gen/essays.css"
    )
)

assets.register('users_css',
    Bundle(
        "scss/users.scss",
        filters="scss,cssmin",
        output="gen/users.css"
    )
)

assets.register('splash_css',
    Bundle(
        "scss/splash.scss",
        filters="scss,cssmin",
        output="gen/splash.css"
    )
)

assets.register('terms-and-conditions_css',
    Bundle(
        "scss/terms-and-conditions.scss",
        filters="scss,cssmin",
        output="gen/terms-and-conditions.css"
    )
)
