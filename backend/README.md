# Delivery Platform API

Backend for the delivery platform built with Node.js, Express, PostgreSQL, and Sequelize.

## Features

- RESTful API with proper resource modeling
- JWT-based authentication
- Role-based access control (Customer, Rider, Admin)
- Input validation with Zod
- Password hashing with bcrypt
- Error handling and logging
- CORS and security middleware
- Rate limiting

## Technology Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT
- bcryptjs
- Zod
-dotenv

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```
   NODE_ENV=development
   PORT=4000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/delivery_api
   JWT_SECRET=your-secret-key-here
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. Run migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

4. Seed initial data:
   ```bash
   npx sequelize-cli db:seed:all
   ```

## Available Scripts

- `npm run dev` - Start server with auto-reload
- `npm start` - Start server in production mode
- `npm run migrate` - Run database migrations
- `npm run seed` - Run database seeders

## API Documentation

See the main [README.md](../README.md) for complete API documentation.

## Project Structure

```
src/
├── models/         # Sequelize models
├── routes/         # API route handlers
├── middleware/     # Custom middleware (auth, error handling)
├── db/             # Database connection and utilities
└── server.js       # Express app entry point
```