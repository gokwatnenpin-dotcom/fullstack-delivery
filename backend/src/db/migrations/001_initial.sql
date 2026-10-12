-- Delivery Platform Schema
-- Safe to re-run (IF NOT EXISTS / idempotent)

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'rider', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE availability_status AS ENUM ('available', 'busy', 'offline');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Users" (
  id          SERIAL PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'customer',
  status      user_status NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Customers" (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER UNIQUE NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  phone       TEXT,
  address     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Riders" (
  id                   SERIAL PRIMARY KEY,
  user_id              INTEGER UNIQUE NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  vehicle_info         JSONB,
  license_info         JSONB,
  availability_status  availability_status NOT NULL DEFAULT 'offline',
  current_location     JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Orders" (
  id                   SERIAL PRIMARY KEY,
  customer_id          INTEGER NOT NULL REFERENCES "Users"(id),
  rider_id             INTEGER REFERENCES "Users"(id),
  pickup_location      JSONB NOT NULL,
  delivery_location    JSONB NOT NULL,
  items                JSONB NOT NULL,
  special_instructions TEXT,
  status               order_status NOT NULL DEFAULT 'pending',
  payment_status       payment_status NOT NULL DEFAULT 'pending',
  payment_method       payment_method,
  amount               NUMERIC(10,2),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Payments" (
  id              SERIAL PRIMARY KEY,
  order_id        INTEGER NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  amount          NUMERIC(10,2) NOT NULL,
  method          payment_method NOT NULL,
  status          payment_status NOT NULL DEFAULT 'pending',
  transaction_id  TEXT,
  payment_details JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DeliveryTrackings" (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  location    JSONB,
  status      order_status,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_customer_idx ON "Orders"(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_rider_idx    ON "Orders"(rider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_order_idx  ON "Payments"(order_id);
