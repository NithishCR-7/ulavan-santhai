import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { payments } from '../models/schema.js';

/**
 * Repository: Payments Data Access Layer
 */

export const create = async (paymentData) => {
  const [created] = await db
    .insert(payments)
    .values({
      ...paymentData,
      paidAt: paymentData.paidAt || new Date(),
    })
    .onConflictDoUpdate({
      target: payments.transactionId,
      set: {
        ...paymentData,
        paidAt: paymentData.paidAt || new Date(),
      },
    })
    .returning();
  return created;
};

export const findById = async (id) => {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);
  return payment || null;
};

export const findByUserId = async (userId) => {
  return await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId));
};

