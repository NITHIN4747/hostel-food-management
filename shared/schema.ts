import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase UID
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  photoURL: text("photo_url"),
  role: text("role").notNull().default("student"),
  hostelRoom: text("hostel_room"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Meal attendance records
export const mealAttendance = pgTable("meal_attendance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner
  attended: boolean("attended").notNull().default(false),
  verificationMethod: text("verification_method"), // face, qr, manual
  verifiedBy: integer("verified_by").references(() => users.id), // staff who verified
  notes: text("notes"),
});

// Leave requests
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: integer("approved_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Financial adjustments
export const financialAdjustments = pgTable("financial_adjustments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  month: text("month").notNull(), // YYYY-MM format
  totalMeals: integer("total_meals").notNull(),
  attendedMeals: integer("attended_meals").notNull(),
  adjustmentAmount: integer("adjustment_amount").notNull(), // in cents
  processed: boolean("processed").notNull().default(false),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
});

// Activities log
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertMealAttendanceSchema = createInsertSchema(mealAttendance).omit({ id: true });
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ id: true, createdAt: true });
export const insertFinancialAdjustmentSchema = createInsertSchema(financialAdjustments).omit({ id: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type MealAttendance = typeof mealAttendance.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type FinancialAdjustment = typeof financialAdjustments.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMealAttendance = z.infer<typeof insertMealAttendanceSchema>;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type InsertFinancialAdjustment = z.infer<typeof insertFinancialAdjustmentSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
