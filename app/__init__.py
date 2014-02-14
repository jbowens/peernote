from flask import Flask, g, request, render_template
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)
app.debug = True
assets = Environment(app)

common_css = Bundle(
    "less/*.less",
    filters="less,cssmin",
    output="gen/dist.css",
)

assets.register('common_css', common_css)

@app.route('/')
def index():
    return render_template('index.html')
