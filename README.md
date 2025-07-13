# E-COMMERCE Project

This project is an e-commerce application with a React frontend and an Express.js backend.

## Backend

The backend is built with Express.js and uses MongoDB for data storage. It provides the following functionalities:

- User authentication (signup, signin, logout, refresh token)
- Product management (add, edit, delete, get products)
- Cart management (add to cart, remove from cart, update cart)
- Coupon management (create, update, delete, apply coupons)
- Payment processing (Stripe integration)
- Analytics (track user activity, sales, etc.)

## Frontend

The frontend is built with React and uses React Router for navigation. It provides the following pages:

- Home page (displays products, categories, etc.)
- Signup page (allows users to create an account)
- Login page (allows users to log in to their account)

## Database Setup

The backend uses MongoDB for data storage. To connect to the database, you need to set the `MONGODB_URI` environment variable to the connection string of your MongoDB database.

## Backend Routes

The backend provides the following routes:

-   `/api/auth` - Authentication routes (signup, signin, logout, refresh token, profile)
-   `/api/products` - Product routes (add, edit, delete, get products)
-   `/api/cart` - Cart routes (add to cart, remove from cart, update cart)
-   `/api/coupons` - Coupon routes (create, update, delete, apply coupons)
-   `/api/payments` - Payment routes (create payment intent, handle webhooks)
-   `/api/analytics` - Analytics routes (track user activity, sales, etc.)

## Frontend Components

The frontend includes the following components:

-   `Navbar` - Navigation bar
-   `HomePage` - Home page
-   `SignupPage` - Signup page
-   `LoginPage` - Login page

## Features

-   User authentication and authorization
-   Product catalog with categories and search
-   Shopping cart and checkout
-   Payment integration with Stripe
-   Coupon codes and discounts
-   Order history and tracking
-   Admin dashboard for managing products, users, and orders
-   Analytics and reporting

## How to run the project

1.  Install the dependencies:

    ```bash
    npm install
    cd frontend
    npm install
    ```
2.  Configure the environment variables:

    Create a `.env` file in the backend and frontend directories and set the necessary environment variables.
3.  Start the backend server:

    ```bash
    npm run dev
    ```
4.  Start the frontend development server:

    ```bash
    cd frontend
    npm run dev
    ```
