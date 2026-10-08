CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('patient', 'provider', 'admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('requested', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE, phone TEXT, address JSONB NOT NULL DEFAULT '{}'::jsonb,
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb, insurance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL, bio TEXT, license_number TEXT UNIQUE, department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), patient_id UUID NOT NULL REFERENCES users(id), provider_id UUID NOT NULL REFERENCES users(id),
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL, status appointment_status NOT NULL DEFAULT 'requested',
  reason TEXT, notes TEXT, location TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT appointment_time_valid CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS appointments_provider_time_idx ON appointments(provider_id, starts_at);
CREATE INDEX IF NOT EXISTS appointments_patient_time_idx ON appointments(patient_id, starts_at);

CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), patient_id UUID NOT NULL REFERENCES users(id), provider_id UUID REFERENCES users(id),
  appointment_id UUID REFERENCES appointments(id), record_type TEXT NOT NULL, title TEXT NOT NULL, content JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), patient_id UUID NOT NULL REFERENCES users(id), provider_id UUID REFERENCES users(id),
  name TEXT NOT NULL, dosage TEXT NOT NULL, frequency TEXT NOT NULL, instructions TEXT, start_date DATE, end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), patient_id UUID NOT NULL REFERENCES users(id), provider_id UUID NOT NULL REFERENCES users(id),
  medication_id UUID REFERENCES medications(id), status TEXT NOT NULL DEFAULT 'active', pharmacy TEXT, issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), patient_id UUID NOT NULL REFERENCES users(id), appointment_id UUID REFERENCES appointments(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0), currency CHAR(3) NOT NULL DEFAULT 'USD', status TEXT NOT NULL DEFAULT 'open',
  due_date DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), patient_id UUID NOT NULL REFERENCES users(id), consent_type TEXT NOT NULL,
  version TEXT NOT NULL, granted BOOLEAN NOT NULL, granted_at TIMESTAMPTZ, revoked_at TIMESTAMPTZ,
  UNIQUE(patient_id, consent_type, version)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_id UUID REFERENCES users(id), action TEXT NOT NULL, resource_type TEXT NOT NULL,
  resource_id UUID, metadata JSONB NOT NULL DEFAULT '{}'::jsonb, ip_address INET, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS medical_records_patient_idx ON medical_records(patient_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS medications_patient_idx ON medications(patient_id, is_active);
