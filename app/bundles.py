from flask.ext.assets import Environment, Bundle
from app import app

assets = Environment(app)

"""
CSS BUNDLES
"""
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

"""
JAVASCRIPT BUNDLES
"""
assets.register('splash_js',
    "js/include/jquery.scrollTo.min.js",
    Bundle(
        "js/splash/email-signup.js",
        "js/splash/splash.js",
        "js/splash/drop-a-line.js",
        filters="rjsmin",
        output="gen/splash.js"
    )
)

assets.register('editor_js',
    Bundle(
        "js/essays/editor.js",
        filters="rjsmin",
        output="gen/editor.js"
    )
)

assets.register('reviewer_js',
    "js/include/rangy-1.2.3/rangy-core.js",
    "js/include/rangy-1.2.3/rangy-cssclassapplier.js",
    "js/include/jquery-ui-1.10.4.custom.min.js",
    "js/include/jquery.qtip-1.0.0-rc3.js",
    Bundle(
        "js/reviews/review.js",
        filters="rjsmin",
        output="gen/editor.js"
    )
)
