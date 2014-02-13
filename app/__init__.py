from flask import Flask, g, request

app = Flask(__name__)

@app.route('/')
def index():
    return 'This is peernote on a nonshitty framework.'

