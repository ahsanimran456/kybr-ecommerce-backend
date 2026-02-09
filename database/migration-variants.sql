-- ============================================================
-- MIGRATION: Product Variants (Sizes + Colors)
-- Supabase SQL Editor mein ye run karo
-- ============================================================

-- 1. Product Variants table
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2) DEFAULT NULL,
  sku TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, size, color)
);

-- 2. Cart items mein variant_id add karo
ALTER TABLE cart_items ADD COLUMN variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE;

-- 3. Old unique constraint hatao aur naya lagao (product + variant unique hona chahiye)
ALTER TABLE cart_items DROP CONSTRAINT cart_items_user_id_product_id_key;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_variant_unique UNIQUE(user_id, product_id, variant_id);

-- 4. Order items mein variant info add karo
ALTER TABLE order_items ADD COLUMN variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN variant_size TEXT DEFAULT '';
ALTER TABLE order_items ADD COLUMN variant_color TEXT DEFAULT '';

-- 5. Indexes
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_active ON product_variants(is_active);
CREATE INDEX idx_cart_items_variant ON cart_items(variant_id);
