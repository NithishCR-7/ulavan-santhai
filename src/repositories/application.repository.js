import { eq, desc } from 'drizzle-orm';
import { db } from '../config/db.js';
import { applications } from '../models/schema.js';

/**
 * Repository: Applications Data Access Layer
 */

export const upsert = async (id, appData) => {
  const [existing] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(applications)
      .set({
        ...appData,
        updatedAt: now,
      })
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(applications)
    .values({
      id,
      ...appData,
      submittedAt: appData.submittedAt || now,
      updatedAt: now,
    })
    .returning();
  return created;
};

export const findById = async (id) => {
  const [app] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  return app || null;
};

export const findLatestByUserId = async (userId) => {
  const [app] = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.submittedAt))
    .limit(1);
  return app || null;
};

