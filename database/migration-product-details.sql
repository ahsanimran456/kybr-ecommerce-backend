-- ============================================================
-- MIGRATION: Product Details + About fields
-- Supabase SQL Editor mein ye run karo
-- ============================================================

ALTER TABLE products ADD COLUMN details TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN about TEXT DEFAULT '';
