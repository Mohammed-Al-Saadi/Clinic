CREATE DATABASE clinic;
CREATE ROLE Ali SUPERUSER LOGIN PASSWORD 'password';



 Admin_role ID :de15ade8-7bfe-4876-a91e-007e6536a251
 user_role ID :d76d5fc8-8d7c-4d77-8ffb-75c954ed5e9b


CREATE TABLE users (
  user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);


 CREATE TABLE roles (
  role_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_name VARCHAR(255) UNIQUE NOT NULL
);



CREATE TABLE user_roles (
  user_role_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  role_id UUID REFERENCES roles(role_id)




 INSERT INTO roles (role_id, role_name)
VALUES
  ('d76d5fc8-8d7c-4d77-8ffb-75c954ed5e9b', 'user'),
  ('de15ade8-7bfe-4876-a91e-007e6536a251', 'admin');

 
 CREATE TABLE user_roles (
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)


ALTER TABLE user_roles
ADD COLUMN role_name VARCHAR(255) NOT NULL;