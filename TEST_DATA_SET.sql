-- TEST_DATA_SET.sql
-- Full database reset + schema creation + exhaustive test data for Video Platform
-- WARNING: This script DROPS existing tables and data. Run only in development/test.

BEGIN;

-- Drop everything related to the app (safe with CASCADE)
DROP TABLE IF EXISTS user_companies CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Create companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  membership_active BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'consumer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create videos table
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many mapping table so a consumer can belong to multiple companies
CREATE TABLE user_companies (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, company_id)
);

-- Indexes
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_videos_company ON videos(company_id);

-- Password hash used for seeded users (bcrypt hash for 'Password123!')
-- Generated externally: $2b$10$1CCn7NxPOEHnlly1cXvBber9BvyXGsR5YKCT09NGpfTPJMHOETbMO
DO $$
DECLARE
  pwd TEXT := '$2b$10$1CCn7NxPOEHnlly1cXvBber9BvyXGsR5YKCT09NGpfTPJMHOETbMO';
BEGIN
  -- Insert 5 companies
  INSERT INTO companies (id, name, code, description, created_at) VALUES
    (1, 'Company 1', 'COMP1', 'Company 1 description', NOW()),
    (2, 'Company 2', 'COMP2', 'Company 2 description', NOW()),
    (3, 'Company 3', 'COMP3', 'Company 3 description', NOW()),
    (4, 'Company 4', 'COMP4', 'Company 4 description', NOW()),
    (5, 'Company 5', 'COMP5', 'Company 5 description', NOW());

  -- Insert two global administrators
  INSERT INTO users (email, password_hash, company_id, membership_active, role, created_at)
    VALUES
      ('superadmin@example.com', pwd, NULL, true, 'super_admin', NOW()),
      ('platformadmin@example.com', pwd, NULL, true, 'platform_admin', NOW());

  -- For each company create 2 company admins and 20 unique consumers
  PERFORM pg_sleep(0); -- noop to keep consistent plpgsql block
END$$;

-- Populate company admins and consumers programmatically
DO $$
DECLARE
  c INTEGER;
  admin1_email TEXT;
  admin2_email TEXT;
  consumer_email TEXT;
  pwd TEXT := '$2b$10$1CCn7NxPOEHnlly1cXvBber9BvyXGsR5YKCT09NGpfTPJMHOETbMO';
  u_id INTEGER;
  i INTEGER;
BEGIN
  FOR c IN 1..5 LOOP
    -- company admins
    admin1_email := format('company%1$s_admin1@example.com', c);
    admin2_email := format('company%1$s_admin2@example.com', c);
    INSERT INTO users (email,password_hash,company_id,membership_active,role,created_at)
      VALUES (admin1_email,pwd,c,true,'company_admin',NOW()) RETURNING id INTO u_id;
    INSERT INTO users (email,password_hash,company_id,membership_active,role,created_at)
      VALUES (admin2_email,pwd,c,true,'company_admin',NOW());

    -- 20 consumers for this company
    FOR i IN 1..20 LOOP
      consumer_email := format('consumer_c%1$s_%2$s@example.com', c, i);
      INSERT INTO users (email,password_hash,company_id,membership_active,role,created_at)
        VALUES (consumer_email,pwd,c,true,'consumer',NOW()) RETURNING id INTO u_id;
      -- insert into mapping table: primary company
      INSERT INTO user_companies (user_id, company_id) VALUES (u_id, c);

      -- For some consumers add additional company memberships to simulate multiple companies
      IF (i % 5 = 0) THEN
        -- add this user to next company (wrap around)
        INSERT INTO user_companies (user_id, company_id) VALUES (u_id, ((c % 5) + 1));
      END IF;
      IF (i % 7 = 0) THEN
        -- add to previous company as well (wrap)
        INSERT INTO user_companies (user_id, company_id) VALUES (u_id, ((c+3) % 5) + 1);
      END IF;
    END LOOP;
  END LOOP;
END$$;

-- Optionally: create sample videos for each company (5 per company)
DO $$
DECLARE
  c INTEGER;
  i INTEGER;
BEGIN
  FOR c IN 1..5 LOOP
    FOR i IN 1..5 LOOP
      INSERT INTO videos (company_id, title, description, url, created_at)
        VALUES (c, format('Sample Video %s - %s', c, i), 'Demo video for testing', format('https://example.com/video/%s/%s', c, i), NOW());
    END LOOP;
  END LOOP;
END$$;

COMMIT;

-- Notes:
-- - This script fully drops and recreates the core schema (companies, users, videos, user_companies)
-- - Seeded accounts use password 'Password123!' (bcrypt hash embedded above). Change pwd variable to use a different hash if you prefer.
-- - Global admins: superadmin@example.com (super_admin) and platformadmin@example.com (platform_admin)
-- - Each company has 2 company_admins and 20 consumers; some consumers are members of multiple companies via user_companies.
-- - 5 sample videos per company are inserted for quick testing.

