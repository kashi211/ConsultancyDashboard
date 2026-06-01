import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

export const typeEnum = pgEnum("opp_type", ["freelance", "pitch", "job"]);
export const statusEnum = pgEnum("opp_status", ["pending", "approved", "needs_edit", "in_progress", "closed", "pitch_approved", "mvp_submitted"]);
export const targetStatusEnum = pgEnum("target_status", ["active", "completed", "paused"]);
export const targetTermEnum = pgEnum("target_term", ["long_term", "short_term"]);
export const serviceStatusEnum = pgEnum("service_status", ["active", "evaluating", "cancelled"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done", "blocked"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);

// --- Opportunities (Pitches page) ---
export const opportunities = pgTable("consultancy_opportunities", {
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

export const comments = pgTable("consultancy_comments", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  author: text("author").notNull().default("Anonymous"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Mission (single row, id=1) ---
export const mission = pgTable("consultancy_mission", {
  id: serial("id").primaryKey(),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Targets ---
export const targets = pgTable("consultancy_targets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  duration: text("duration"),
  status: targetStatusEnum("status").notNull().default("active"),
  term: targetTermEnum("term").notNull().default("short_term"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const targetComments = pgTable("consultancy_target_comments", {
  id: serial("id").primaryKey(),
  targetId: integer("target_id").notNull().references(() => targets.id, { onDelete: "cascade" }),
  author: text("author").notNull().default("Anonymous"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Tasks ---
export const tasks = pgTable("consultancy_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  assignee: text("assignee"),
  dueDate: text("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const taskComments = pgTable("consultancy_task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  author: text("author").notNull().default("Anonymous"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Services ---
export const services = pgTable("consultancy_services", {
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
export const portfolio = pgTable("consultancy_portfolio", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  repoUrl: text("repo_url"),
  skills: text("skills"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Notices (editable callout boxes, keyed) ---
export const notices = pgTable("consultancy_notices", {
  id:        serial("id").primaryKey(),
  key:       text("key").notNull().unique(),
  content:   text("content").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Notice = typeof notices.$inferSelect;

// --- Notes ---
export const notes = pgTable("consultancy_notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Untitled"),
  content: text("content").notNull().default(""),
  color: text("color").notNull().default("white"),
  pinned: integer("pinned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Mission = typeof mission.$inferSelect;
export type Target = typeof targets.$inferSelect;
export type TargetComment = typeof targetComments.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskComment = typeof taskComments.$inferSelect;
export type Service = typeof services.$inferSelect;
export type PortfolioItem = typeof portfolio.$inferSelect;
