from app import app
from datetime import datetime
from apscheduler.scheduler import Scheduler
from sqldump import sqldump_job

def start_scheduled_jobs():
    sched = Scheduler()
    sched.start()

    # add scheduler jobs below

    if app.config.get('IS_PRODUCTION'):
        sched.add_interval_job(sqldump_job, days=1)
