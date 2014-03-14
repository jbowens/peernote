from flask.ext.assets import Environment, Bundle
from app import app

assets = Environment(app)

"""
CSS BUNDLES
"""
assets.register('base_css',
    "include/font-awesome/css/font-awesome.min.css",
    Bundle(
        "scss/reset.scss",
        "scss/bootstrap.scss",
        "scss/top_nav.scss",
        "scss/shared/_footer.scss",
        "scss/shared/_base.scss",
        "scss/shared/_flashes.scss",
        "scss/errors.scss",
        depends="scss/shared/*.scss",
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

assets.register('meet-the-team_css',
    Bundle(
        "scss/meet-the-team.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/home.css",
    )
)

# TODO: essays.scss needs to go eventually
assets.register('essays_css',
    Bundle(
        "scss/essays.scss",
        "scss/essays_print.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/essays.css"
    )
)

assets.register('essays_index_css',
    Bundle(
        "scss/widgets/essays_list.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/essays_index.css"
    )
)

assets.register('signup_css',
    Bundle(
        "scss/signup.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/signup.css"
    )
)

assets.register("forgot-password_css",
    Bundle(
        "scss/forgot-password.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/forgot-password.css"
    )
)

assets.register("reset-password_css",
    Bundle(
        "scss/reset-password.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/reset-password.css"
    )
)

assets.register('login_css',
    Bundle(
        "scss/login.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/signup.css"
    )
)

assets.register('editor_css',
    Bundle(
        "scss/widgets/essays_list.scss",
        "scss/editor.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss, scss/editor-toolkit.scss",
        output="gen/editor.css"
    )
)

assets.register('users_css',
    Bundle(
        "scss/users.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/users.css"
    )
)

assets.register('splash_css',
    Bundle(
        "scss/splash.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/splash.css"
    )
)

assets.register('terms-and-conditions_css',
    Bundle(
        "scss/terms-and-conditions.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/terms-and-conditions.css"
    )
)

assets.register('settings_css',
    Bundle(
        "scss/settings.scss",
        filters="scss,cssmin",
        depends="scss/shared/*.scss",
        output="gen/settings.css"
    )
)


"""
JAVASCRIPT BUNDLES
"""
assets.register('base_js',
    "js/include/jquery-2.1.0.min.js",
    Bundle(
        "js/init.js",
        "js/navbar.js",
        "js/errors.js",
        filters="rjsmin",
        output="gen/base.js"
    )
)

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
        "js/essays/document.js",
        "js/essays/commands.js",
        "js/essays/docutils.js",
        "js/widgets/essays_list.js",
        "js/essays/controller.js",
        filters="rjsmin",
        output="gen/editor.js"
    )
)

assets.register('essays_index_js',
    Bundle(
        "js/widgets/essays_list.js",
        "js/essays/index.js",
        filters="rjsmin",
        output="gen/essays_index.js"
    )
)

assets.register('reviewer_js',
    "js/include/rangy-1.2.3/rangy-core.js",
    "js/include/rangy-1.2.3/rangy-cssclassapplier.js",
    "js/include/jquery-ui-1.10.4.custom.min.js",
    "js/include/jquery.qtip-1.0.0-rc3.js",
    Bundle(
        "js/essays/docutils.js",
        "js/reviews/review.js",
        filters="rjsmin",
        output="gen/reviewer.js"
    )
)
