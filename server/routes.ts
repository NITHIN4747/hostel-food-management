import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertMealSchema,
  insertMealPreferenceSchema,
  insertMealAttendanceSchema,
  insertNotificationSchema,
  insertLeaveRequestSchema
} from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler helper
  const handleError = (res: Response, error: unknown) => {
    console.error("API Error:", error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  };

  // Users API
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/users/by-username/:username", async (req, res) => {
    try {
      const username = req.params.username;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Meals API
  app.get("/api/meals", async (req, res) => {
    try {
      const meals = await storage.getMeals();
      res.json(meals);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const mealData = insertMealSchema.parse(req.body);
      const meal = await storage.createMeal(mealData);
      res.status(201).json(meal);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Meal Preferences API
  app.post("/api/meal-preferences", async (req, res) => {
    try {
      const preferenceData = insertMealPreferenceSchema.parse(req.body);
      const preference = await storage.createMealPreference(preferenceData);
      res.status(201).json(preference);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/meal-preferences", async (req, res) => {
    try {
      const { userId, date } = req.query;
      
      if (userId && date) {
        const userIdNum = parseInt(userId as string);
        const preference = await storage.getMealPreference(userIdNum, date as string);
        
        if (!preference) {
          return res.status(404).json({ error: "Meal preference not found" });
        }
        
        return res.json(preference);
      }
      
      const preferences = await storage.getMealPreferences(
        userId ? parseInt(userId as string) : undefined
      );
      
      res.json(preferences);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/meal-preferences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const preferenceUpdate = req.body;
      
      const updatedPreference = await storage.updateMealPreference(id, preferenceUpdate);
      
      if (!updatedPreference) {
        return res.status(404).json({ error: "Meal preference not found" });
      }
      
      res.json(updatedPreference);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Meal Attendance API
  app.post("/api/meal-attendance", async (req, res) => {
    try {
      const attendanceData = insertMealAttendanceSchema.parse(req.body);
      const attendance = await storage.createMealAttendance(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/meal-attendance", async (req, res) => {
    try {
      const { userId, date, mealType } = req.query;
      
      if (!userId || !date) {
        return res.status(400).json({ error: "User ID and date are required" });
      }
      
      const userIdNum = parseInt(userId as string);
      const attendance = await storage.getMealAttendance(
        userIdNum,
        date as string,
        mealType as string | undefined
      );
      
      res.json(attendance);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Notifications API
  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/notifications", async (req, res) => {
    try {
      const { userId, unreadOnly } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const userIdNum = parseInt(userId as string);
      const onlyUnread = unreadOnly === "true";
      
      const notifications = await storage.getNotifications(userIdNum, onlyUnread);
      res.json(notifications);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Leave Requests API
  app.post("/api/leave-requests", async (req, res) => {
    try {
      const leaveRequestData = insertLeaveRequestSchema.parse(req.body);
      const leaveRequest = await storage.createLeaveRequest({
        ...leaveRequestData,
        timestamp: new Date()
      });
      res.status(201).json(leaveRequest);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/leave-requests", async (req, res) => {
    try {
      const { userId, status } = req.query;
      
      const requests = await storage.getLeaveRequests(
        userId ? parseInt(userId as string) : undefined,
        status as string | undefined
      );
      
      res.json(requests);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/leave-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const leaveRequest = await storage.getLeaveRequestById(id);
      
      if (!leaveRequest) {
        return res.status(404).json({ error: "Leave request not found" });
      }
      
      res.json(leaveRequest);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/leave-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Valid status is required" });
      }
      
      const leaveRequest = await storage.updateLeaveRequestStatus(id, status);
      
      if (!leaveRequest) {
        return res.status(404).json({ error: "Leave request not found" });
      }
      
      res.json(leaveRequest);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Reports API
  app.get("/api/reports/financial-summary", async (req, res) => {
    try {
      const { userId, startDate, endDate } = req.query;
      
      if (!userId || !startDate || !endDate) {
        return res.status(400).json({ 
          error: "User ID, start date, and end date are required" 
        });
      }
      
      const userIdNum = parseInt(userId as string);
      const report = await storage.getFinancialSummary(
        userIdNum,
        startDate as string,
        endDate as string
      );
      
      res.json(report);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/reports/food-wastage", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: "Start date and end date are required" 
        });
      }
      
      const report = await storage.getFoodWastageReport(
        startDate as string,
        endDate as string
      );
      
      res.json(report);
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
