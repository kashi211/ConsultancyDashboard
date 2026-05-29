import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

export const typeEnum = pgEnum("opp_type", ["freelance", "pitch", "job"]);
export const statusEnum = pgEnum("opp_status", ["pending", "approved", "needs_edit", "in_progress", "closed"]);

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: typeEnum("type").notNull(),
  status: statusEnum("status").notNull().default("pending"),
  pitch: text("pitch"),
  jobLink: text("job_link"),
  mvpLink: text("mvp_link"),
  budget: text("budget"),
  deadline: text("deadline"),
  skills: text("skills"),
  author: text("author").notNull().default("Anonymous"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  author: text("author").notNull().default("Anonymous"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
