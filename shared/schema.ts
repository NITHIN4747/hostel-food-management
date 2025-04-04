import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("student"),
  roomNumber: text("room_number"),
  hostelId: text("hostel_id")
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  type: text("type").notNull(), // breakfast, lunch, dinner
  price: integer("price").notNull().default(75), // Default price is Rs.75
});

export const mealPreferences = pgTable("meal_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  breakfast: boolean("breakfast").notNull().default(true),
  lunch: boolean("lunch").notNull().default(true),
  dinner: boolean("dinner").notNull().default(true),
  fullDayLeave: boolean("full_day_leave").notNull().default(false)
});

export const mealAttendance = pgTable("meal_attendance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner
  attended: boolean("attended").notNull().default(false),
  timestamp: timestamp("timestamp").notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  role: true,
  roomNumber: true,
  hostelId: true
});

export const insertMealSchema = createInsertSchema(meals).pick({
  date: true,
  type: true,
  price: true
});

export const insertMealPreferenceSchema = createInsertSchema(mealPreferences).pick({
  userId: true,
  date: true,
  breakfast: true,
  lunch: true,
  dinner: true,
  fullDayLeave: true
});

export const insertMealAttendanceSchema = createInsertSchema(mealAttendance).pick({
  userId: true,
  date: true,
  mealType: true,
  attended: true,
  timestamp: true
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  message: true,
  read: true,
  timestamp: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

export type InsertMealPreference = z.infer<typeof insertMealPreferenceSchema>;
export type MealPreference = typeof mealPreferences.$inferSelect;

export type InsertMealAttendance = z.infer<typeof insertMealAttendanceSchema>;
export type MealAttendance = typeof mealAttendance.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
