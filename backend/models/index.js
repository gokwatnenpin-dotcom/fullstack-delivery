import { Sequelize } from 'sequelize';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const env = process.env.NODE_ENV || 'development';

// Build Sequelize instance from DATABASE_URL (production/render) or config.json (development)
const isLocalhost =
  process.env.DATABASE_URL?.includes('localhost') ||
  process.env.DATABASE_URL?.includes('127.0.0.1');

const requiresSsl =
  !isLocalhost &&
  (env === 'production' ||
    process.env.DATABASE_URL?.includes('render.com') ||
    process.env.DB_SSL === 'true');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: requiresSsl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  });
} else {
  // Fallback: use config.json for local development
  const { default: configRaw } = await import('../config/config.json', { with: { type: 'json' } });
  const config = configRaw[env];
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging ?? false,
  });
}

// Import all model definition functions (ESM)
const { default: UserDef }             = await import('./user.js');
const { default: CustomerDef }         = await import('./customer.js');
const { default: RiderDef }            = await import('./rider.js');
const { default: OrderDef }            = await import('./order.js');
const { default: PaymentDef }          = await import('./payment.js');
const { default: DeliveryTrackingDef } = await import('./deliverytracking.js');

const User             = UserDef(sequelize, Sequelize.DataTypes);
const Customer         = CustomerDef(sequelize, Sequelize.DataTypes);
const Rider            = RiderDef(sequelize, Sequelize.DataTypes);
const Order            = OrderDef(sequelize, Sequelize.DataTypes);
const Payment          = PaymentDef(sequelize, Sequelize.DataTypes);
const DeliveryTracking = DeliveryTrackingDef(sequelize, Sequelize.DataTypes);

const db = { User, Customer, Rider, Order, Payment, DeliveryTracking };

// Run associations
for (const model of Object.values(db)) {
  if (typeof model.associate === 'function') {
    model.associate(db);
  }
}

export { User, Customer, Rider, Order, Payment, DeliveryTracking, sequelize, Sequelize };
