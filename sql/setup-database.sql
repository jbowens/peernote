--
-- Creates the PostgreSQL database and database user. This SQL
-- should be run a PostgreSQL superuser.
--
CREATE ROLE peernote LOGIN;
CREATE DATABASE peernote OWNER peernote;
GRANT ALL PRIVILEGES ON DATABASE peernote TO peernote;
