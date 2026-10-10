-- ==============================================================================
-- DESTINITY ES - SUPABASE DATABASE SCHEMA, RLS & SEED DATA
-- Platform: Next.js (App Router) + Supabase (PostgreSQL + RLS + Storage)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & HELPERS
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'shipped', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- ------------------------------------------------------------------------------
-- 2. TABLE: profiles
-- Linked to Supabase Auth auth.users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer'::user_role NOT NULL,
    avatar_url TEXT,
    shipping_addresses JSONB DEFAULT '[]'::jsonb,
    billing_addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: categories
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: products
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(10, 2) CHECK (sale_price IS NULL OR sale_price < price),
    sku TEXT UNIQUE,
    stock INT DEFAULT 0 NOT NULL CHECK (stock >= 0),
    is_published BOOLEAN DEFAULT true NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    featured_image TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    variants JSONB DEFAULT '[]'::jsonb, -- e.g. [{"name": "Talla", "options": ["S", "M", "L", "XL"]}]
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: orders
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE, -- e.g. "DES-2026-1001"
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    payment_method TEXT NOT NULL, -- 'stripe', 'bizum', 'paypal', 'apple_pay'
    payment_status payment_status DEFAULT 'pending'::payment_status NOT NULL,
    order_status order_status DEFAULT 'pending'::order_status NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 21.00 NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    shipping_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. TABLE: order_items
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    product_image TEXT,
    variant_selected JSONB DEFAULT '{}'::jsonb,
    price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. TABLE: invoices
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE, -- e.g. "INV-2026-0001"
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    pdf_url TEXT,
    file_path TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 21.00 NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'issued' NOT NULL, -- 'draft', 'issued', 'void'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. TABLE: store_settings
-- Global fiscal & configuration settings for Spain/EU eCommerce
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    store_name TEXT DEFAULT 'Destinity ES' NOT NULL,
    legal_name TEXT DEFAULT 'Destinity Luxury Goods S.L.' NOT NULL,
    cif_nif TEXT DEFAULT 'B-88776655' NOT NULL,
    fiscal_address TEXT DEFAULT 'Paseo de la Castellana 140, Planta 7' NOT NULL,
    city TEXT DEFAULT 'Madrid' NOT NULL,
    postal_code TEXT DEFAULT '28046' NOT NULL,
    province TEXT DEFAULT 'Madrid' NOT NULL,
    country TEXT DEFAULT 'España' NOT NULL,
    phone TEXT DEFAULT '+34 910 00 22 33' NOT NULL,
    email TEXT DEFAULT 'contacto@destinity.es' NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 21.00 NOT NULL,
    free_shipping_threshold NUMERIC(10, 2) DEFAULT 120.00 NOT NULL,
    standard_shipping_cost NUMERIC(10, 2) DEFAULT 4.95 NOT NULL,
    invoice_prefix TEXT DEFAULT 'INV-2026' NOT NULL,
    invoice_footer_note TEXT DEFAULT 'Inscrita en el Registro Mercantil de Madrid. IVA incluido al 21% según el Régimen General.' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure default single row exists
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Helper Function: Check if currently authenticated user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile or admins view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile or admins update any"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- CATEGORIES POLICIES
CREATE POLICY "Public can view categories"
    ON public.categories FOR SELECT
    TO PUBLIC USING (true);

CREATE POLICY "Only admins can modify categories"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- PRODUCTS POLICIES
CREATE POLICY "Public can view published products"
    ON public.products FOR SELECT
    TO PUBLIC USING (is_published = true OR public.is_admin());

CREATE POLICY "Only admins can insert/update/delete products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- ORDERS POLICIES
CREATE POLICY "Customers view own orders or admins view all"
    ON public.orders FOR SELECT
    USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Anyone can create orders (authenticated or checkout guest)"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only admins or service role can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

-- ORDER ITEMS POLICIES
CREATE POLICY "Users view order items of their orders or admin"
    ON public.order_items FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
          AND (orders.customer_id = auth.uid() OR public.is_admin())
      )
    );

CREATE POLICY "Anyone can insert order items during checkout"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

-- INVOICES POLICIES
CREATE POLICY "Customers view invoices for own orders or admin"
    ON public.invoices FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = invoices.order_id
          AND (orders.customer_id = auth.uid() OR public.is_admin())
      )
    );

CREATE POLICY "Only admins can manage invoices"
    ON public.invoices FOR ALL
    USING (public.is_admin());

-- STORE SETTINGS POLICIES
CREATE POLICY "Public can read store settings"
    ON public.store_settings FOR SELECT
    TO PUBLIC USING (true);

CREATE POLICY "Only admins can modify store settings"
    ON public.store_settings FOR UPDATE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. AUTH TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email IN ('admin@destinity.es', 'music@destinity.es') THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKETS SETUP
-- Run via Supabase SQL Editor to configure buckets and storage policies
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Public read for product images
CREATE POLICY "Public product images access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Storage Policy: Admin write for product images
CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- Storage Policy: Invoices read for owner or admin
CREATE POLICY "Invoice read access"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoices' AND (
      public.is_admin() OR
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- ------------------------------------------------------------------------------
-- 12. SAMPLE SEED DATA (DESTINITY ES - LUXURY EDITORIAL CATALOG)
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, image_url, display_order)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Moda & Sastrería', 'moda-sastreria', 'Prendas contemporáneas confeccionadas con tejidos nobles y patronaje arquitectónico.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Marroquinería & Cuero', 'marroquineria-cuero', 'Bolsos, carteras y accesorios artesanales curtidos al vegetal en Ubrique.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Alta Relojería & Joyería', 'alta-relojeria', 'Piezas de precisión en metales nobles y diseño atemporal para coleccionistas.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Aromas & Lifestyle', 'aromas-lifestyle', 'Fragancias nicho, velas botánicas y objetos de diseño para interiores distinguidos.', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, title, slug, description, price, sale_price, sku, stock, is_published, category_id, featured_image, gallery_images, tags, variants)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Abrigo Estructurado de Cachemira "Élysée"',
    'abrigo-estructurado-cachemira-elysee',
    'Confeccionado en doble faz de cachemira italiana 100%. Solapas arquitectónicas, botonadura de cuerno pulido y corte recto relajado que redefine la silueta invernal contemporánea.',
    640.00,
    580.00,
    'DES-MOD-01',
    14,
    true,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85',
    ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85'],
    ARRAY['Cachemira', 'Invierno', 'Premium', 'Edición Limitada'],
    '[{"name": "Talla", "options": ["46 (S)", "48 (M)", "50 (L)", "52 (XL)"]}, {"name": "Color", "options": ["Negro Carbón", "Camello Tostado"]}]'::jsonb
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'Tote Bag en Piel Graneada "Vanguardia"',
    'tote-bag-piel-graneada-vanguardia',
    'Bolso tote estructurado en piel vacuna española de primera selección con curtición vegetal. Forro interior de ante aterciopelado, herrajes bañados en oro cepillado de 18k y compartimento para portátil acolchado.',
    395.00,
    NULL,
    'DES-ACC-02',
    8,
    true,
    'c1000000-0000-0000-0000-000000000002',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
    ARRAY['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85'],
    ARRAY['Piel Genuina', 'Ubrique', 'Accesorios', 'Bestseller'],
    '[{"name": "Color", "options": ["Cognac Noble", "Negro Ónix", "Verde Bosque"]}]'::jsonb
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'Cronógrafo Automático "Aeterna 41mm"',
    'cronografo-automatico-aeterna-41mm',
    'Calibre suizo automático con reserva de marcha de 48 horas. Caja de acero 316L satinado, cristal de zafiro antirreflejante de doble cúpula y correa de piel de becerro al tono cosida a mano.',
    1250.00,
    1150.00,
    'DES-WAT-03',
    5,
    true,
    'c1000000-0000-0000-0000-000000000003',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
    ARRAY['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85'],
    ARRAY['Relojería', 'Automático', 'Zafiro', 'Suiza'],
    '[{"name": "Esfera", "options": ["Negro Mate", "Azul Medianoche", "Plata Cepillada"]}]'::jsonb
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'Extrait de Parfum "Santal Noir" (100ml)',
    'extrait-de-parfum-santal-noir',
    'Concentración del 30% de esencia pura. Salida de cardamomo negro y pimienta rosa, corazón de sándalo australiano y violeta silvestre sobre una base untuosa de ámbar gris y cedro del Atlas.',
    185.00,
    NULL,
    'DES-FRG-04',
    22,
    true,
    'c1000000-0000-0000-0000-000000000004',
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=85',
    ARRAY['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85'],
    ARRAY['Nicho', 'Perfumería', 'Sándalo', 'Unisex'],
    '[{"name": "Tamaño", "options": ["50 ml", "100 ml"]}]'::jsonb
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'Gafas de Sol de Titanio "Solstice"',
    'gafas-sol-titanio-solstice',
    'Montura geométrica ultraligera en titanio japonés japonés con acabado rutenio. Lentes minerales polarizadas Zeiss con protección 100% UV400 y tratamiento antirreflejo interior.',
    280.00,
    NULL,
    'DES-OPT-05',
    12,
    true,
    'c1000000-0000-0000-0000-000000000002',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85',
    ARRAY['https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1000&q=85'],
    ARRAY['Titanio', 'Óptica', 'Zeiss', 'Minimalismo'],
    '[{"name": "Color Montura", "options": ["Titanio Natural", "Oro Champagne", "Negro Mate"]}]'::jsonb
  ),
  (
    'b1000000-0000-0000-0000-000000000006',
    'Blazer Oversize en Lana Virgen & Seda',
    'blazer-oversize-lana-virgen-seda',
    'Diseño de sastrería desestructurada con hombreras sutiles y caída fluida. Tejido en telar artesanal con mezcla 80% lana virgen y 20% seda natural para una textura envolvente.',
    420.00,
    380.00,
    'DES-MOD-06',
    3, -- Alerta de stock bajo para el CMS
    true,
    'c1000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1000&q=85',
    ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85'],
    ARRAY['Sastrería', 'Seda', 'Oversize'],
    '[{"name": "Talla", "options": ["36", "38", "40", "42"]}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
