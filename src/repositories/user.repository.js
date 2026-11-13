import { eq, or } from 'drizzle-orm';
import { db } from '../config/db.js';
import { users } from '../models/schema.js';

/**
 * Repository: User Data Access Layer
 * Encapsulates all database operations on the 'users' table.
 */

/**
 * Find user by primary key ID
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findById = async (id) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user || null;
};

/**
 * Find user by normalized email
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export const findByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user || null;
};

/**
 * Find user by email or mobile number (duplicate detection)
 * @param {string} email
 * @param {string} mobile
 * @returns {Promise<object|null>}
 */
export const findByEmailOrMobile = async (email, mobile) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      isVerified: users.isVerified,
      role: users.role,
      onboarded: users.onboarded,
      sellerOnboarded: users.sellerOnboarded,
      buyerOnboarded: users.buyerOnboarded,
    })
    .from(users)
    .where(or(eq(users.email, email), eq(users.mobile, mobile)))
    .limit(1);
  return user || null;
};

/**
 * Find user by login identifier (email, mobile, or username) with password hash for authentication
 * @param {string} identifier
 * @returns {Promise<object|null>}
 */
export const findForLogin = async (identifier) => {
  const clean = String(identifier || '').trim();
  const digits = clean.replace(/\D/g, '');
  const tenDigitMobile = digits.length >= 10 ? digits.slice(-10) : digits;

  const [user] = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, clean.toLowerCase()),
        eq(users.mobile, clean),
        eq(users.mobile, tenDigitMobile),
        eq(users.username, clean)
      )
    )
    .limit(1);
  return user || null;
};

/**
 * Create and insert a new verified user record
 * @param {object} userData
 * @returns {Promise<object>}
 */
export const create = async (userData) => {
  const [newUser] = await db
    .insert(users)
    .values({
      ...userData,
      sellerOnboarded: false,
      buyerOnboarded: false,
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date(),
    })
    .returning();
  return newUser;
};

/**
 * Update user record by primary key ID
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object>}
 */
export const update = async (id, updateData) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  return updatedUser;
};

/**
 * Mark seller onboarding as active without touching buyer onboarding
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const updateSellerOnboarding = async (userId) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      sellerOnboarded: true,
      onboarded: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
};

/**
 * Mark buyer onboarding as active without touching seller onboarding
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const updateBuyerOnboarding = async (userId) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      buyerOnboarded: true,
      onboarded: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
};
