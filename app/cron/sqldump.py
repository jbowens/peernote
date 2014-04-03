from datetime import datetime
import subprocess
from datetime import datetime
from app.app_root import APP_ROOT

"""
Dump peernote db into sql/backups directory
"""
def sqldump_job():
    filename = datetime.today().strftime('%Y-%m-%d-%H:%M') + '.dump'
    subprocess.call("pg_dump peernote > " + APP_ROOT + '/../sql/backups/' + filename , shell=True)
