import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const passwordHash = await bcrypt.hash('ziggy1234', 12);

const users = [
  { email: 'customer@example.com', firstName: 'Alex',     lastName: 'Morgan',  role: 'customer' },
  { email: 'rider@example.com',    firstName: 'Sam',      lastName: 'Okafor',  role: 'rider' },
  { email: 'admin@example.com',    firstName: 'Platform', lastName: 'Admin',   role: 'admin' },
];

try {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ids = {};
    for (const user of users) {
      const result = await client.query(
        `INSERT INTO "Users" (email, password_hash, first_name, last_name, role, status)
         VALUES ($1, $2, $3, $4, $5::user_role, 'active')
         ON CONFLICT (email) DO UPDATE
           SET first_name = EXCLUDED.first_name,
               last_name  = EXCLUDED.last_name,
               role       = EXCLUDED.role
         RETURNING id`,
        [user.email, passwordHash, user.firstName, user.lastName, user.role]
      );
      ids[user.email] = result.rows[0].id;
    }

    // Create customer profile
    await client.query(
      `INSERT INTO "Customers" (user_id, phone, address)
       VALUES ($1, '+1 555 0100', '{"city":"Lagos","country":"NG"}')
       ON CONFLICT (user_id) DO NOTHING`,
      [ids['customer@example.com']]
    );

    // Create rider profile
    await client.query(
      `INSERT INTO "Riders" (user_id, vehicle_info, license_info, availability_status)
       VALUES ($1, '{"type":"motorcycle","plate":"LAG-001"}', '{"number":"DL-12345"}', 'available')
       ON CONFLICT (user_id) DO NOTHING`,
      [ids['rider@example.com']]
    );

    await client.query('COMMIT');
    console.log('Seed completed with demo delivery platform data.');
    console.log('Demo accounts: customer@example.com, rider@example.com, admin@example.com');
    console.log('Password for all demo accounts: ziggy1234');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
