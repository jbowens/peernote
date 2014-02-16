#!/usr/bin/env bash
SCRIPT_DIR=$(dirname ${BASH_SOURCE[0]})
ROOT_DIR=$(dirname $SCRIPT_DIR)
# Drop the database
python $ROOT_DIR/app/drop_db.py
# Launch the server
python $ROOT_DIR/server.py
