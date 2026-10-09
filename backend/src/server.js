import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sequelize } from '../models/index.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import riderRoutes from './routes/riders.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, notFound } from './middleware/error.js';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'local-development-only-change-me';
  console.warn('JWT_SECRET is not set; using a development-only secret. Configure backend/.env before deployment.');
}

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') ?? '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Global Rate Limiter
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7', // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}));

// Core/System Routes (Changed from app.use to app.get)
app.get('/', (_req, res) => res.json({ name: 'Delivery Platform API', version: '1.0.0' }));
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// API Features Routing
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Fallback error handlers
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models (Consider altering/migrating instead of full sync in production)
    await sequelize.sync();
    console.log('All models were synchronized successfully.');

    const port = Number(process.env.PORT || 4000);
    app.listen(port, () => console.log(`Delivery Platform API listening on http://localhost:${port}`));
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
