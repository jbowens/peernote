#!/usr/bin/env bash
SCRIPT_DIR=$(dirname ${BASH_SOURCE[0]})
ROOT_DIR=$(dirname $SCRIPT_DIR)
psql --file=$ROOT_DIR/sql/setup-database.sql
