import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

export const typeEnum = pgEnum("opp_type", ["freelance", "pitch", "job"]);
export const statusEnum = pgEnum("opp_status", ["pending", "approved", "needs_edit", "in_progress", "closed"]);
export const targetStatusEnum = pgEnum("target_status", ["active", "completed", "paused"]);
export const serviceStatusEnum = pgEnum("service_status", ["active", "evaluating", "cancelled"]);

// --- Opportunities (Pitches page) ---
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

// --- Mission (single row, id=1) ---
export const mission = pgTable("mission", {
  id: serial("id").primaryKey(),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Targets ---
export const targets = pgTable("targets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  duration: text("duration"),
  status: targetStatusEnum("status").notNull().default("active"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const targetComments = pgTable("target_comments", {
  id: serial("id").primaryKey(),
  targetId: integer("target_id").notNull().references(() => targets.id, { onDelete: "cascade" }),
  author: text("author").notNull().default("Anonymous"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Services ---
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  url: text("url"),
  status: serviceStatusEnum("status").notNull().default("active"),
  cost: text("cost"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Portfolio ---
export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  repoUrl: text("repo_url"),
  skills: text("skills"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Mission = typeof mission.$inferSelect;
export type Target = typeof targets.$inferSelect;
export type TargetComment = typeof targetComments.$inferSelect;
export type Service = typeof services.$inferSelect;
export type PortfolioItem = typeof portfolio.$inferSelect;
