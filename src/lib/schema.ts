import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", [
  "pitch",
  "mvp_link",
  "pdf_pitch",
  "job_suggestion",
  "freelance",
  "coworker_suggestion",
]);

export const statusEnum = pgEnum("status", [
  "pending",
  "approved",
  "needs_edit",
]);

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  status: statusEnum("status").notNull().default("pending"),
  url: text("url"),
  author: text("author").notNull().default("Anonymous"),
  editSuggestion: text("edit_suggestion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
