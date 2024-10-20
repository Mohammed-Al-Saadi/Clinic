# README: User Management System with Authentication and Authorization

## Overview

This project implements a **User Management System** using Node.js and PostgreSQL. The system includes functionalities like user registration, login, profile management, password updates, and role-based access control (RBAC) for administrative tasks. It also supports authentication via JSON Web Tokens (JWT) and sends email notifications using **Nodemailer**.

## Key Features

1. **User Registration**:

   - Users can register with first name, last name, email, and password. The password is hashed using **bcrypt**.
   - On registration, users are assigned a default role of "user".
   - A check ensures that the email is unique.

2. **User Login**:

   - Users log in with their email and password.
   - The system generates an access token and refresh token using **JWT**, which includes the user's role and status.

3. **User Profile Management**:

   - Users can update their profile information (first name, last name, email).
   - Users can change their password after verifying their current password.

4. **Admin Features**:

   - **Get All Users**: Admins can view all registered users.
   - **Update User Role**: Admins can promote users to the "admin" role.
   - **Deactivate User Account**: Admins can deactivate a user's account by changing their status.

5. **Role-Based Access Control (RBAC)**:

   - Only admins have access to certain routes, enforced via a custom middleware.
   - Non-admin users are restricted from accessing administrative functionalities.

6. **Email Notifications**:

   - Users receive an email verification code when they request to reset their password.
   - Password reset links are sent via email using **Nodemailer**.

7. **JWT Authentication**:
   - Tokens are used to authenticate users for protected routes.
   - Access tokens expire after 15 minutes, while refresh tokens are used to generate new access tokens.

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Web framework for handling routes and requests.
- **PostgreSQL**: Database for storing user information.
- **Bcrypt**: Library for hashing passwords.
- **JWT (JSON Web Tokens)**: Used for user authentication.
- **Nodemailer**: Used to send email notifications.
- **dotenv**: For managing environment variables.
- **pg**: PostgreSQL client for Node.js.

## Project Structure

- **controllers/**: Contains the logic for user-related operations (e.g., registration, login, profile update).
- **middlewares/**: Includes authentication and role-checking middleware.
- **routes/**: Defines the API routes for users and admin-related tasks.
- **utils/**: Utility functions like sending emails and generating tokens.
- **config/**: Database connection pool setup using `pg`.
