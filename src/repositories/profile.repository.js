import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { buyerProfiles, sellerProfiles } from '../models/schema.js';

/**
 * Repository: Profile Data Access Layer
 * Encapsulates all database operations on 'buyer_profiles' and 'seller_profiles' tables.
 */

/**
 * Find buyer profile by user ID
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findBuyerByUserId = async (userId) => {
  const [profile] = await db
    .select()
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, userId))
    .limit(1);
  return profile || null;
};

/**
 * Upsert buyer profile (creates if not existing, updates if already present)
 * @param {string} userId
 * @param {object} buyerData
 * @returns {Promise<object>}
 */
export const upsertBuyer = async (userId, buyerData) => {
  const existing = await findBuyerByUserId(userId);
  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(buyerProfiles)
      .set({
        ...buyerData,
        updatedAt: now,
      })
      .where(eq(buyerProfiles.userId, userId))
      .returning();
    return updated;
  }

  const profileId = buyerData.id || `BP_${crypto.randomInt(100000, 999999)}`;
  const [created] = await db
    .insert(buyerProfiles)
    .values({
      id: profileId,
      userId,
      ...buyerData,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
};

/**
 * Find seller profile by user ID
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findSellerByUserId = async (userId) => {
  const [profile] = await db
    .select()
    .from(sellerProfiles)
    .where(eq(sellerProfiles.userId, userId))
    .limit(1);
  return profile || null;
};

/**
 * Upsert seller profile (creates if not existing, updates if already present)
 * @param {string} userId
 * @param {object} sellerData
 * @returns {Promise<object>}
 */
export const upsertSeller = async (userId, sellerData) => {
  const existing = await findSellerByUserId(userId);
  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(sellerProfiles)
      .set({
        ...sellerData,
        updatedAt: now,
      })
      .where(eq(sellerProfiles.userId, userId))
      .returning();
    return updated;
  }

  const profileId = sellerData.id || `SP_${crypto.randomInt(100000, 999999)}`;
  const [created] = await db
    .insert(sellerProfiles)
    .values({
      id: profileId,
      userId,
      ...sellerData,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
};

