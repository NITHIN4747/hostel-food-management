import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("student"),
  roomNumber: text("room_number"),
  hostelId: text("hostel_id"),
  academicYear: text("academic_year"),
  totalMealFees: integer("total_meal_fees").default(0) // Total meal fees for academic year
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  type: text("type").notNull(), // breakfast, lunch, dinner
  price: integer("price").notNull().default(75), // Default price is Rs.75
  items: json("items").$type<string[]>().default([]), // Meal items for the day
  nutritionalInfo: json("nutritional_info").$type<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>().default({ calories: 0, protein: 0, carbs: 0, fat: 0 })
});

export const mealPreferences = pgTable("meal_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  breakfast: boolean("breakfast").notNull().default(true),
  lunch: boolean("lunch").notNull().default(true),
  dinner: boolean("dinner").notNull().default(true),
  fullDayLeave: boolean("full_day_leave").notNull().default(false),
  dietaryRestrictions: json("dietary_restrictions").$type<string[]>().default([])
});

export const mealAttendance = pgTable("meal_attendance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner
  attended: boolean("attended").notNull().default(false),
  timestamp: timestamp("timestamp").notNull(),
  hostelAttendanceSync: boolean("hostel_attendance_sync").default(false) // Flag if synced with hostel attendance
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  timestamp: timestamp("timestamp").notNull(),
});

// Table for leave requests (for skipping meals that were marked as willing)
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  timestamp: timestamp("timestamp").notNull(),
});

// Table for meal feedback and ratings
export const mealFeedback = pgTable("meal_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mealId: integer("meal_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 rating
  feedback: text("feedback"),
  timestamp: timestamp("timestamp").notNull()
});

// Table for academic year financial summary
export const financialSummary = pgTable("financial_summary", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  academicYear: text("academic_year").notNull(), // e.g., "2023-2024"
  totalMealFees: integer("total_meal_fees").notNull(), // Total meal fees for the year
  totalSavings: integer("total_savings").notNull().default(0), // Total amount saved
  mealsAttended: integer("meals_attended").notNull().default(0), // Total meals attended
  mealsSkipped: integer("meals_skipped").notNull().default(0), // Total meals skipped
  lastUpdated: timestamp("last_updated").notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  role: true,
  roomNumber: true,
  hostelId: true,
  academicYear: true,
  totalMealFees: true
});

export const insertMealSchema = createInsertSchema(meals).pick({
  date: true,
  type: true,
  price: true,
  items: true,
  nutritionalInfo: true
});

export const insertMealPreferenceSchema = createInsertSchema(mealPreferences).pick({
  userId: true,
  date: true,
  breakfast: true,
  lunch: true,
  dinner: true,
  fullDayLeave: true,
  dietaryRestrictions: true
});

export const insertMealAttendanceSchema = createInsertSchema(mealAttendance).pick({
  userId: true,
  date: true,
  mealType: true,
  attended: true,
  timestamp: true,
  hostelAttendanceSync: true
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  message: true,
  read: true,
  timestamp: true
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).pick({
  userId: true,
  date: true,
  mealType: true,
  reason: true,
  status: true,
  timestamp: true
});

export const insertMealFeedbackSchema = createInsertSchema(mealFeedback).pick({
  userId: true,
  mealId: true,
  rating: true,
  feedback: true,
  timestamp: true
});

export const insertFinancialSummarySchema = createInsertSchema(financialSummary).pick({
  userId: true,
  academicYear: true,
  totalMealFees: true,
  totalSavings: true,
  mealsAttended: true,
  mealsSkipped: true,
  lastUpdated: true
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

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;

export type InsertMealFeedback = z.infer<typeof insertMealFeedbackSchema>;
export type MealFeedback = typeof mealFeedback.$inferSelect;

export type InsertFinancialSummary = z.infer<typeof insertFinancialSummarySchema>;
export type FinancialSummary = typeof financialSummary.$inferSelect;
