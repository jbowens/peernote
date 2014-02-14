from flask.ext.assets import Environment, Bundle
from flask.ext.sqlalchemy import SQLAlchemy
from app import db

db.drop_all()
