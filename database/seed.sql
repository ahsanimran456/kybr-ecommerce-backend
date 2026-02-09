-- ============================================================
-- SEED: Create first Super Admin
-- ============================================================
-- STEP 1: Pehle Supabase Dashboard > Authentication > Users > Add User
--         se ek user create karo (email + password)
--
-- STEP 2: Phir neeche apna email daal ke ye SQL run karo:
-- ============================================================

UPDATE profiles
SET role = 'super_admin'
WHERE email = 'YOUR_ADMIN_EMAIL_HERE';

-- ============================================================
-- Verify: Check karo ke admin ban gaya
-- ============================================================
-- SELECT * FROM profiles WHERE role = 'super_admin';

-- ============================================================
-- OPTIONAL: Sample categories insert karo
-- ============================================================
-- INSERT INTO categories (name, slug, description) VALUES
--   ('Electronics', 'electronics', 'Electronic gadgets and devices'),
--   ('Clothing', 'clothing', 'Fashion and apparel'),
--   ('Books', 'books', 'Books and stationery');
