import {
  boolean,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "backlog",
  "in-progress",
  "review",
  "completed",
  "archived"
]);

export const projectPriorityEnum = pgEnum("project_priority", [
  "low",
  "medium",
  "high",
  "critical"
]);

export const clientTypeEnum = pgEnum("client_type", ["person", "company"]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: projectStatusEnum("status").notNull().default("backlog"),
  priority: projectPriorityEnum("priority").notNull().default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: clientTypeEnum("type").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull().default("0"),
  startDate: timestamp("start_date", { withTimezone: false }).notNull(),
  endDate: timestamp("end_date", { withTimezone: false }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  mimeType: text("mime_type").notNull(),
  extension: text("extension").notNull(),
  size: decimal("size", { precision: 15, scale: 2 }).notNull().default("0"),
  s3Key: text("s3_key").notNull(),
  s3Bucket: text("s3_bucket").notNull(),
  url: text("url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type FileObject = typeof files.$inferSelect;
export type NewFileObject = typeof files.$inferInsert;

