CREATE DATABASE clinic;
CREATE ROLE Ali SUPERUSER LOGIN PASSWORD 'password';

CREATE TABLE users (
  user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
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

