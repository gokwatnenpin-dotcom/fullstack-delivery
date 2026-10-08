# Delivery Platform

A full-stack delivery platform built with Node.js, Express, PostgreSQL, Sequelize, React, Vite, and Tailwind CSS.

## Features

- **Three User Roles**: Customers, Riders, and Administrators
- **Complete Delivery Lifecycle**: Pending → Confirmed → Assigned → Picked Up → In Transit → Delivered/Cancelled
- **Payment Processing**: Cash, Card, and Bank Transfer options
- **Real-time Tracking**: Location updates during delivery
- **Role-Based Access Control**: Secure endpoints with JWT authentication
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- Sequelize ORM
- JWT for authentication
- bcrypt for password hashing
- Zod for input validation

### Frontend
- React 18
- Vite build tool
- Tailwind CSS for styling
- React Router for navigation

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ..
   npm install
   ```

### Environment Setup

Create a `.env` file in the backend directory:
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/delivery_api
JWT_SECRET=your-secret-key-here
CLIENT_ORIGIN=http://localhost:5173
```

Create a `.env` file in the root directory (for frontend):
```
VITE_API_URL=
```

### Database Setup

1. Ensure PostgreSQL is running
2. Create the database:
   ```bash
   createdb delivery_api
   ```
3. Run migrations:
   ```bash
   cd backend
   npx sequelize-cli db:migrate
   ```
4. Seed initial data:
   ```bash
   npx sequelize-cli db:seed:all
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
3. The application will be available at http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Customers
- `GET /api/customers/me` - Get customer profile
- `PUT /api/customers/me` - Update customer profile

### Riders
- `GET /api/riders/me` - Get rider profile
- `PUT /api/riders/me` - Update rider profile
- `PATCH /api/riders/availability` - Update rider availability
- `GET /api/riders/available` - Get available riders (admin only)

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order
- `PATCH /api/orders/:id/status` - Update order status

### Payments
- `GET /api/payments/:orderId` - Get payment for an order
- `PATCH /api/payments/:orderId` - Update payment status

### Admin
- `GET /admin/users` - Get all users
- `GET /admin/orders` - Get all orders
- `GET /admin/riders` - Get all riders
- `GET /admin/stats` - Get platform statistics

## Demo Accounts

After seeding the database, you can log in with:

- **Admin**: admin@delivery.com / admin1234
- **Customer**: customer@delivery.com / password123
- **Rider**: rider@delivery.com / password123

## Deployment

The platform is designed to be deployed on Render.com:
- Backend service connects to Render PostgreSQL
- Frontend served via Vercel or Render static site
- Environment variables configured in respective platforms

## License

MIT