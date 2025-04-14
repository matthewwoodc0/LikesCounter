import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const likeCounters = pgTable("like_counters", {
  id: serial("id").primaryKey(),
  count: integer("count").notNull().default(0),
  name: text("name").notNull().default("default")
});

export const insertLikeCounterSchema = createInsertSchema(likeCounters).pick({
  count: true,
  name: true,
});

export type InsertLikeCounter = z.infer<typeof insertLikeCounterSchema>;
export type LikeCounter = typeof likeCounters.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
