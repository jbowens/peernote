import sys
sys.dont_write_bytecode = True

from app import app
app.run(port=3000)
