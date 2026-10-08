import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sequelize } from './models/index.js';
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
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') ?? '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.get('/', (_req, res) => res.json({ name: 'Delivery Platform API', version: '1.0.0' }));
app.use('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
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