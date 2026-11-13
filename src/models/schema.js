import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';

/**
 * 1. Users Table
 * Tracks authentication, verification, and independent dual-role onboarding status (Seller & Buyer).
 */
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  mobile: varchar('mobile', { length: 15 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  role: varchar('role', { length: 30 }).default('USER').notNull(),
  onboarded: boolean('onboarded').default(false).notNull(),

  // Independent Dual-Role Onboarding Flags
  sellerOnboarded: boolean('seller_onboarded').default(false).notNull(),
  buyerOnboarded: boolean('buyer_onboarded').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 2. Documents Table
 * Metadata for documents stored in Supabase Storage public bucket 'user_documents'.
 */
export const documents = pgTable('documents', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id).notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  storagePath: text('storage_path').notNull(),
  fileSize: numeric('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 30 }).default('UPLOADED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * 3. Buyer Profiles Table (Clean Unified Schema)
 * Supports all 7 dynamic buyer classifications with common queryable columns
 * and full category attributes in 'category_details' (JSONB).
 */
export const buyerProfiles = pgTable('buyer_profiles', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id).unique().notNull(),
  buyerType: varchar('buyer_type', { length: 50 }).notNull(),

  // Unified Identity & Brand
  businessName: varchar('business_name', { length: 150 }).notNull(),

  // Geographic Location
  district: varchar('district', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }),
  pinCode: varchar('pin_code', { length: 20 }),
  address: text('address'),

  // Compliance
  isGst: boolean('is_gst').default(false).notNull(),
  gstin: varchar('gstin', { length: 50 }),
  fssaiNumber: varchar('fssai_number', { length: 50 }),

  // Unified Discovery & Sourcing
  targetCommodities: text('target_commodities'),
  procurementVolume: varchar('procurement_volume', { length: 100 }),

  // Dynamic Full-Fidelity Category Attributes
  categoryDetails: jsonb('category_details').default({}).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 4. Seller Profiles Table (Clean Unified Schema)
 * Supports all 8 seller classifications with common queryable columns
 * and full category attributes in 'category_details' (JSONB).
 */
export const sellerProfiles = pgTable('seller_profiles', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id).unique().notNull(),
  sellerType: varchar('seller_type', { length: 50 }).notNull(),

  // Unified Identity & Brand
  businessName: varchar('business_name', { length: 150 }).notNull(),

  // Geographic Location
  district: varchar('district', { length: 100 }).notNull(),
  village: varchar('village', { length: 100 }),
  pinCode: varchar('pin_code', { length: 20 }),
  farmAddress: text('farm_address'),

  // Compliance
  isGst: boolean('is_gst').default(false).notNull(),
  gstin: varchar('gstin', { length: 50 }),
  fssaiNumber: varchar('fssai_number', { length: 50 }),

  // Unified Operational Discovery
  primaryProducts: text('primary_products'),
  capacity: varchar('capacity', { length: 100 }),

  // Dynamic Full-Fidelity Category Attributes
  categoryDetails: jsonb('category_details').default({}).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 5. Applications Table
 * Records submitted onboarding applications with full profile audit snapshot.
 */
export const applications = pgTable('applications', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id).notNull(),
  role: varchar('role', { length: 30 }).notNull(),
  subType: varchar('sub_type', { length: 50 }).notNull(),
  profilePayload: jsonb('profile_payload').default({}),
  documents: jsonb('documents'),
  overallStatus: varchar('overall_status', { length: 30 }).default('PENDING_REVIEW').notNull(),
  adminComments: text('admin_comments'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 6. Payments Table
 * Records onboarding payments and membership fees.
 */
export const payments = pgTable('payments', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id).notNull(),
  transactionId: varchar('transaction_id', { length: 100 }).notNull().unique(),
  amount: numeric('amount', { precision: 10, scale: 2 }).default('365.00').notNull(),
  role: varchar('role', { length: 30 }).default('BUYER').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).default('UPI').notNull(),
  plan: varchar('plan', { length: 100 }).notNull(),
  status: varchar('status', { length: 30 }).default('CONFIRMED').notNull(),
  paidAt: timestamp('paid_at').defaultNow().notNull(),
});
