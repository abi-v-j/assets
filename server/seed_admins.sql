-- ==============================================================================
-- 3 ADMIN USERS SEED TEMPLATE (SQL)
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Replace the email ('admin1@company.com', etc.) with your email addresses.
-- 2. Replace 'AdminPass123!' with your desired passwords.
-- 3. Run this file in your PostgreSQL database (pgAdmin / DBeaver / psql).
-- The crypt() function uses Blowfish bcrypt via PostgreSQL pgcrypto extension.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
VALUES
    -- Admin 1: Superadmin
    (
        'admin1@company.com',
        crypt('AdminPass123!', gen_salt('bf', 8)),
        'Primary Superadmin',
        'SUPERADMIN',
        TRUE
    ),

    -- Admin 2: Operations Admin
    (
        'admin2@company.com',
        crypt('AdminPass123!', gen_salt('bf', 8)),
        'Operations Administrator',
        'ADMIN',
        TRUE
    ),

    -- Admin 3: Finance Admin
    (
        'admin3@company.com',
        crypt('AdminPass123!', gen_salt('bf', 8)),
        'Finance Administrator',
        'ADMIN',
        TRUE
    )
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Verification query:
SELECT user_id, email, full_name, role, is_active, created_at FROM admin_users;
