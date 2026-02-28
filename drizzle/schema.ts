import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tracks which stations have been visited, and optionally stores a photo.
 * One row per (userId, stationId) pair — stationId is the string id from stationsData.ts
 * e.g. "bak-01", "cen-25", etc.
 */
export const stationVisits = mysqlTable("station_visits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stationId: varchar("stationId", { length: 32 }).notNull(),
  /** S3 key for the uploaded photo, null if no photo attached */
  photoKey: varchar("photoKey", { length: 512 }),
  /** Public CDN URL for the photo */
  photoUrl: varchar("photoUrl", { length: 1024 }),
  /** Original filename for display */
  photoFilename: varchar("photoFilename", { length: 255 }),
  visitedAt: timestamp("visitedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StationVisit = typeof stationVisits.$inferSelect;
export type InsertStationVisit = typeof stationVisits.$inferInsert;