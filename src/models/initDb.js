import { queryClient } from '../config/db.js';

export const initAllTables = async () => {
  try {
    console.log('[DATABASE] Running schema migration in Supabase...');

    await queryClient.unsafe(`
      CREATE TABLE IF NOT EXISTS public.users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        mobile VARCHAR(15) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        role VARCHAR(30) NOT NULL DEFAULT 'unassigned',
        sub_type VARCHAR(50),
        onboarded BOOLEAN NOT NULL DEFAULT FALSE,
        application_id VARCHAR(64),
        seller_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
        buyer_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Ensure new columns are added if users table already exists
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS seller_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS buyer_onboarded BOOLEAN NOT NULL DEFAULT FALSE;

      CREATE TABLE IF NOT EXISTS public.documents (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        file_size NUMERIC NOT NULL,
        mime_type VARCHAR(50) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'UPLOADED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.payments (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        transaction_id VARCHAR(100) NOT NULL UNIQUE,
        amount NUMERIC(10, 2) NOT NULL DEFAULT 365.00,
        role VARCHAR(30) NOT NULL DEFAULT 'SELLER',
        payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
        plan VARCHAR(100) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
        paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.buyer_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
        buyer_type VARCHAR(50) NOT NULL,
        business_name VARCHAR(150),
        district VARCHAR(100),
        city VARCHAR(100),
        pin_code VARCHAR(20),
        address TEXT,
        is_gst BOOLEAN NOT NULL DEFAULT FALSE,
        gstin VARCHAR(50),
        fssai_number VARCHAR(50),
        target_commodities TEXT,
        procurement_volume VARCHAR(100),
        category_details JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Ensure new clean columns are added if buyer_profiles already existed
      ALTER TABLE public.buyer_profiles
      ADD COLUMN IF NOT EXISTS business_name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS target_commodities TEXT,
      ADD COLUMN IF NOT EXISTS procurement_volume VARCHAR(100),
      ADD COLUMN IF NOT EXISTS category_details JSONB NOT NULL DEFAULT '{}';

      -- Auto-backfill existing legacy buyer rows
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buyer_profiles' AND column_name = 'company_name') THEN
          UPDATE public.buyer_profiles
          SET business_name = COALESCE(business_name, company_name, shop_name, 'Buyer Enterprise')
          WHERE business_name IS NULL;

          -- Clean up obsolete columns from buyer_profiles
          ALTER TABLE public.buyer_profiles
          DROP COLUMN IF EXISTS commodities,
          DROP COLUMN IF EXISTS volume,
          DROP COLUMN IF EXISTS frequency,
          DROP COLUMN IF EXISTS payment_method,
          DROP COLUMN IF EXISTS payment_terms,
          DROP COLUMN IF EXISTS constitution,
          DROP COLUMN IF EXISTS designation,
          DROP COLUMN IF EXISTS company_name,
          DROP COLUMN IF EXISTS activity,
          DROP COLUMN IF EXISTS raw_materials,
          DROP COLUMN IF EXISTS capacity,
          DROP COLUMN IF EXISTS shop_name,
          DROP COLUMN IF EXISTS reseller_type;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS public.seller_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
        seller_type VARCHAR(50) NOT NULL,
        business_name VARCHAR(150),
        district VARCHAR(100),
        village VARCHAR(100),
        pin_code VARCHAR(20),
        farm_address TEXT,
        is_gst BOOLEAN NOT NULL DEFAULT FALSE,
        gstin VARCHAR(50),
        fssai_number VARCHAR(50),
        primary_products TEXT,
        capacity VARCHAR(100),
        category_details JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Ensure new clean columns are added if seller_profiles already existed
      ALTER TABLE public.seller_profiles
      ADD COLUMN IF NOT EXISTS business_name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS primary_products TEXT,
      ADD COLUMN IF NOT EXISTS capacity VARCHAR(100),
      ADD COLUMN IF NOT EXISTS category_details JSONB NOT NULL DEFAULT '{}';

      -- Ensure profile_payload exists on applications
      ALTER TABLE public.applications
      ADD COLUMN IF NOT EXISTS profile_payload JSONB DEFAULT '{}';

      CREATE TABLE IF NOT EXISTS public.applications (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        role VARCHAR(30) NOT NULL,
        sub_type VARCHAR(50) NOT NULL,
        profile_payload JSONB DEFAULT '{}',
        documents JSONB,
        overall_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
        admin_comments TEXT,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Auto-backfill existing legacy rows
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_profiles' AND column_name = 'farm_name') THEN
          UPDATE public.seller_profiles
          SET business_name = COALESCE(business_name, farm_name, 'Farm Enterprise')
          WHERE business_name IS NULL;

          UPDATE public.seller_profiles
          SET category_details = jsonb_build_object(
            'farmName', farm_name,
            'landSize', land_size,
            'crops', crops,
            'farmingMethod', farming_method
          )
          WHERE (category_details IS NULL OR category_details = '{}'::jsonb) AND farm_name IS NOT NULL;

          -- Clean up legacy clutter columns
          ALTER TABLE public.seller_profiles
          DROP COLUMN IF EXISTS farm_name,
          DROP COLUMN IF EXISTS land_size,
          DROP COLUMN IF EXISTS category,
          DROP COLUMN IF EXISTS crops,
          DROP COLUMN IF EXISTS available_qty,
          DROP COLUMN IF EXISTS harvest_months,
          DROP COLUMN IF EXISTS price_expectation,
          DROP COLUMN IF EXISTS farming_method,
          DROP COLUMN IF EXISTS fpo_name,
          DROP COLUMN IF EXISTS fpo_structure,
          DROP COLUMN IF EXISTS reg_number,
          DROP COLUMN IF EXISTS member_count,
          DROP COLUMN IF EXISTS combined_acreage,
          DROP COLUMN IF EXISTS cert_status,
          DROP COLUMN IF EXISTS cert_agency,
          DROP COLUMN IF EXISTS scope_number,
          DROP COLUMN IF EXISTS brand_name,
          DROP COLUMN IF EXISTS monthly_capacity;
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
      CREATE INDEX IF NOT EXISTS idx_users_mobile ON public.users(mobile);
      CREATE INDEX IF NOT EXISTS idx_buyer_profiles_district ON public.buyer_profiles(district);
      CREATE INDEX IF NOT EXISTS idx_buyer_profiles_type ON public.buyer_profiles(buyer_type);
      CREATE INDEX IF NOT EXISTS idx_buyer_profiles_bname ON public.buyer_profiles(business_name);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_district ON public.seller_profiles(district);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_type ON public.seller_profiles(seller_type);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_bname ON public.seller_profiles(business_name);
    `);

    console.log('[DATABASE] Migration completed successfully in Supabase.');
    return { ok: true, message: 'All tables initialized and updated' };
  } catch (error) {
    console.error('[DATABASE ERROR] Failed to initialize tables:', error.message);
    throw error;
  }
};

if (process.argv[1]?.endsWith('initDb.js')) {
  initAllTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
