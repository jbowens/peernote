from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand
from os import environ
import os, uuid, socket

from app import app
from app import db

# setup migrations
migrate = Migrate(app, db)
manager = Manager(app)
manager.add_command('db', MigrateCommand)


if __name__ == '__main__':
    manager.run()
