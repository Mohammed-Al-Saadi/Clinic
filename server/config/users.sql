CREATE DATABASE clinic;
CREATE ROLE Ali SUPERUSER LOGIN PASSWORD 'password';

CREATE TABLE IF NOT EXISTS users (
    user_id uuid DEFAULT uuid_generate_v4 (),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100) NOT NULL
);

INSERT INTO users ( first_name, last_name, email, password, role)
VALUES ('abdo', 'saadi', 'abdo@yaho.com',abdo123,'admin');

ALTER TABLE users  
ADD COLUMN role varchar(100);

ALTER TABLE users   
ALTER COLUMN role  
SET DEFAULT 'user';


UPDATE users
SET role = 'admin'
WHERE email = 'aje@yahoo.com' ;

