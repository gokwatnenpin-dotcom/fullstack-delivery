import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const passwordHash = await bcrypt.hash('ziggy1234', 12);

const users = [
  { email: 'patient@example.com', firstName: 'Alex', lastName: 'Morgan', role: 'patient' },
  { email: 'doctor@example.com', firstName: 'Sarah', lastName: 'Chen', role: 'provider' },
  { email: 'pediatrics@example.com', firstName: 'Michael', lastName: 'Rodriguez', role: 'provider' },
  { email: 'mentalhealth@example.com', firstName: 'Amanda', lastName: 'Foster', role: 'provider' },
  { email: 'admin@example.com', firstName: 'Platform', lastName: 'Admin', role: 'admin' },
];

const providers = [
  ['doctor@example.com', 'Cardiology', 'Interventional cardiology and preventive heart care.', 'DEMO-LICENSE-001', 'Heart & Vascular'],
  ['pediatrics@example.com', 'Pediatrics', 'Child development, adolescent health, and family-centred care.', 'DEMO-LICENSE-002', 'Children\'s Health'],
  ['mentalhealth@example.com', 'Mental wellbeing', 'Practical, compassionate support for mental and emotional health.', 'DEMO-LICENSE-003', 'Behavioral Health'],
];

try {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ids = {};
    for (const user of users) {
      const result = await client.query(`INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5::user_role)
        ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role
        RETURNING id`, [user.email, passwordHash, user.firstName, user.lastName, user.role]);
      ids[user.email] = result.rows[0].id;
    }

    await client.query(`INSERT INTO patient_profiles (user_id, date_of_birth, phone, address, emergency_contact, insurance)
      VALUES ($1, '1990-04-12', '+1 555 0100', '{"city":"Springfield","country":"US"}', '{"name":"Jamie Morgan","phone":"+1 555 0101","relationship":"Sibling"}', '{"provider":"Demo Health","memberId":"DEMO-12345"}')
      ON CONFLICT (user_id) DO UPDATE SET phone = EXCLUDED.phone`, [ids['patient@example.com']]);

    for (const [email, specialty, bio, licenseNumber, department] of providers) {
      await client.query(`INSERT INTO provider_profiles (user_id, specialty, bio, license_number, department)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET specialty = EXCLUDED.specialty, bio = EXCLUDED.bio, department = EXCLUDED.department`,
      [ids[email], specialty, bio, licenseNumber, department]);
    }

    const appointment = await client.query(`INSERT INTO appointments (patient_id, provider_id, starts_at, ends_at, status, reason, location)
      SELECT $1, $2, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 30 minutes', 'confirmed', 'Annual preventive heart check', 'Main clinic - Room 204'
      WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE patient_id = $1 AND provider_id = $2 AND reason = 'Annual preventive heart check')
      RETURNING id`, [ids['patient@example.com'], ids['doctor@example.com']]);
    const appointmentId = appointment.rows[0]?.id || (await client.query(`SELECT id FROM appointments WHERE patient_id = $1 AND provider_id = $2 AND reason = 'Annual preventive heart check' LIMIT 1`, [ids['patient@example.com'], ids['doctor@example.com']])).rows[0].id;

    const record = await client.query(`INSERT INTO medical_records (patient_id, provider_id, appointment_id, record_type, title, content)
      SELECT $1, $2, $3, 'visit_note', 'Annual wellness visit', '{"summary":"Patient reports good general health.","vitals":{"heightCm":178,"weightKg":76,"bloodPressure":"118/76"},"followUp":"Continue annual screening."}'
      WHERE NOT EXISTS (SELECT 1 FROM medical_records WHERE patient_id = $1 AND title = 'Annual wellness visit')
      RETURNING id`, [ids['patient@example.com'], ids['doctor@example.com'], appointmentId]);
    const recordId = record.rows[0]?.id;

    const medication = await client.query(`INSERT INTO medications (patient_id, provider_id, name, dosage, frequency, instructions, start_date, is_active)
      SELECT $1, $2, 'Vitamin D3', '1000 IU', 'Once daily', 'Take with food.', CURRENT_DATE, TRUE
      WHERE NOT EXISTS (SELECT 1 FROM medications WHERE patient_id = $1 AND name = 'Vitamin D3') RETURNING id`, [ids['patient@example.com'], ids['doctor@example.com']]);
    const medicationId = medication.rows[0]?.id || (await client.query(`SELECT id FROM medications WHERE patient_id = $1 AND name = 'Vitamin D3' LIMIT 1`, [ids['patient@example.com']])).rows[0].id;

    await client.query(`INSERT INTO prescriptions (patient_id, provider_id, medication_id, status, pharmacy)
      SELECT $1, $2, $3, 'active', 'DemoCare Pharmacy'
      WHERE NOT EXISTS (SELECT 1 FROM prescriptions WHERE patient_id = $1 AND medication_id = $3)`, [ids['patient@example.com'], ids['doctor@example.com'], medicationId]);
    await client.query(`INSERT INTO invoices (patient_id, appointment_id, amount_cents, currency, status, due_date)
      SELECT $1, $2, 12500, 'USD', 'open', CURRENT_DATE + 30
      WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE patient_id = $1 AND appointment_id = $2)`, [ids['patient@example.com'], appointmentId]);
    await client.query(`INSERT INTO consents (patient_id, consent_type, version, granted, granted_at)
      VALUES ($1, 'care_and_treatment', '2026.1', TRUE, NOW())
      ON CONFLICT (patient_id, consent_type, version) DO UPDATE SET granted = TRUE, granted_at = COALESCE(consents.granted_at, NOW())`, [ids['patient@example.com']]);
    await client.query(`INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata)
      VALUES ($1, 'seeded_demo_data', 'medical_record', $2, '{"source":"development_seed"}')`, [ids['admin@example.com'], recordId || appointmentId]);

    await client.query('COMMIT');
    console.log('Seed completed with demo healthcare data.');
    console.log('Demo accounts: patient@example.com, doctor@example.com, admin@example.com');
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
