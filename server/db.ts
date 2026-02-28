import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, stationVisits, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Station Visit Helpers ────────────────────────────────────────────────────

/** Get all visited station records for a user */
export async function getVisitsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stationVisits).where(eq(stationVisits.userId, userId));
}

/** Mark a station as visited (idempotent) */
export async function upsertVisit(userId: number, stationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(stationVisits)
    .where(and(eq(stationVisits.userId, userId), eq(stationVisits.stationId, stationId)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(stationVisits).values({ userId, stationId });
  }
  const rows = await db
    .select()
    .from(stationVisits)
    .where(and(eq(stationVisits.userId, userId), eq(stationVisits.stationId, stationId)))
    .limit(1);
  return rows[0];
}

/** Remove a visit record */
export async function deleteVisit(userId: number, stationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(stationVisits)
    .where(and(eq(stationVisits.userId, userId), eq(stationVisits.stationId, stationId)));
}

/** Attach a photo to an existing visit */
export async function updateVisitPhoto(
  userId: number,
  stationId: string,
  photoKey: string,
  photoUrl: string,
  photoFilename: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(stationVisits)
    .set({ photoKey, photoUrl, photoFilename })
    .where(and(eq(stationVisits.userId, userId), eq(stationVisits.stationId, stationId)));
}

/** Remove a photo from a visit (keeps the visit record) */
export async function clearVisitPhoto(userId: number, stationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(stationVisits)
    .set({ photoKey: null, photoUrl: null, photoFilename: null })
    .where(and(eq(stationVisits.userId, userId), eq(stationVisits.stationId, stationId)));
}

/** Delete ALL visits for a user (reset) */
export async function deleteAllVisits(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(stationVisits).where(eq(stationVisits.userId, userId));
}
