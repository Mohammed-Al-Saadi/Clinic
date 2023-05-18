CREATE DATABASE clinic;
CREATE ROLE Ali SUPERUSER LOGIN PASSWORD 'password';

CREATE TABLE IF NOT EXISTS users (
    user_id uuid DEFAULT uuid_generate_v4 (),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100) NOT NULL
);

INSERT INTO users ( first_name, last_name, email, password)
VALUES ('sss', 'dasd', 'sdfsfeee',123232);




