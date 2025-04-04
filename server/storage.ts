import {
  users, type User, type InsertUser,
  meals, type Meal, type InsertMeal,
  mealPreferences, type MealPreference, type InsertMealPreference,
  mealAttendance, type MealAttendance, type InsertMealAttendance,
  notifications, type Notification, type InsertNotification,
  leaveRequests, type LeaveRequest, type InsertLeaveRequest
} from "../shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Meals
  getMeals(): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  
  // Meal Preferences
  getMealPreference(userId: number, date: string): Promise<MealPreference | undefined>;
  getMealPreferences(userId?: number): Promise<MealPreference[]>;
  createMealPreference(preference: InsertMealPreference): Promise<MealPreference>;
  updateMealPreference(id: number, preference: Partial<InsertMealPreference>): Promise<MealPreference | undefined>;
  
  // Meal Attendance
  getMealAttendance(userId: number, date: string, mealType?: string): Promise<MealAttendance[]>;
  createMealAttendance(attendance: InsertMealAttendance): Promise<MealAttendance>;
  
  // Notifications
  getNotifications(userId: number, onlyUnread?: boolean): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Leave Requests
  getLeaveRequests(userId?: number, status?: string): Promise<LeaveRequest[]>;
  getLeaveRequestById(id: number): Promise<LeaveRequest | undefined>;
  createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequestStatus(id: number, status: string): Promise<LeaveRequest | undefined>;
  
  // Reports
  getFinancialSummary(userId: number, startDate: string, endDate: string): Promise<any>;
  getFoodWastageReport(startDate: string, endDate: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meals: Map<number, Meal>;
  private mealPreferences: Map<number, MealPreference>;
  private mealAttendance: Map<number, MealAttendance>;
  private notifications: Map<number, Notification>;
  private leaveRequests: Map<number, LeaveRequest>;
  
  private userIdCounter: number;
  private mealIdCounter: number;
  private preferenceIdCounter: number;
  private attendanceIdCounter: number;
  private notificationIdCounter: number;
  private leaveRequestIdCounter: number;

  constructor() {
    this.users = new Map();
    this.meals = new Map();
    this.mealPreferences = new Map();
    this.mealAttendance = new Map();
    this.notifications = new Map();
    this.leaveRequests = new Map();
    
    this.userIdCounter = 1;
    this.mealIdCounter = 1;
    this.preferenceIdCounter = 1;
    this.attendanceIdCounter = 1;
    this.notificationIdCounter = 1;
    this.leaveRequestIdCounter = 1;
    
    // Initialize with some default meals
    this.setupDefaultMeals();
  }
  
  private setupDefaultMeals() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Create today's meals
    this.createMeal({
      date: today,
      type: "breakfast",
      price: 75
    });
    
    this.createMeal({
      date: today,
      type: "lunch",
      price: 75
    });
    
    this.createMeal({
      date: today,
      type: "dinner",
      price: 75
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Meal methods
  async getMeals(): Promise<Meal[]> {
    return Array.from(this.meals.values());
  }
  
  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const id = this.mealIdCounter++;
    const meal = { ...insertMeal, id };
    this.meals.set(id, meal);
    return meal;
  }
  
  // Meal Preference methods
  async getMealPreference(userId: number, date: string): Promise<MealPreference | undefined> {
    return Array.from(this.mealPreferences.values()).find(
      (pref) => pref.userId === userId && pref.date === date
    );
  }
  
  async getMealPreferences(userId?: number): Promise<MealPreference[]> {
    let preferences = Array.from(this.mealPreferences.values());
    
    if (userId) {
      preferences = preferences.filter(pref => pref.userId === userId);
    }
    
    return preferences;
  }
  
  async createMealPreference(insertPreference: InsertMealPreference): Promise<MealPreference> {
    const id = this.preferenceIdCounter++;
    const preference = { ...insertPreference, id };
    this.mealPreferences.set(id, preference);
    return preference;
  }
  
  async updateMealPreference(id: number, preferenceUpdate: Partial<InsertMealPreference>): Promise<MealPreference | undefined> {
    const existingPreference = this.mealPreferences.get(id);
    
    if (!existingPreference) {
      return undefined;
    }
    
    const updatedPreference = { ...existingPreference, ...preferenceUpdate };
    this.mealPreferences.set(id, updatedPreference);
    return updatedPreference;
  }
  
  // Meal Attendance methods
  async getMealAttendance(userId: number, date: string, mealType?: string): Promise<MealAttendance[]> {
    let attendances = Array.from(this.mealAttendance.values()).filter(
      (att) => att.userId === userId && att.date === date
    );
    
    if (mealType) {
      attendances = attendances.filter(att => att.mealType === mealType);
    }
    
    return attendances;
  }
  
  async createMealAttendance(insertAttendance: InsertMealAttendance): Promise<MealAttendance> {
    const id = this.attendanceIdCounter++;
    const attendance = { ...insertAttendance, id };
    this.mealAttendance.set(id, attendance);
    return attendance;
  }
  
  // Notification methods
  async getNotifications(userId: number, onlyUnread: boolean = false): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values()).filter(
      (notif) => notif.userId === userId
    );
    
    if (onlyUnread) {
      notifications = notifications.filter(notif => !notif.read);
    }
    
    // Sort by timestamp, newest first
    notifications.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    
    return notifications;
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const notification = { ...insertNotification, id };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    
    if (!notification) {
      return undefined;
    }
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  // Leave Request methods
  async getLeaveRequests(userId?: number, status?: string): Promise<LeaveRequest[]> {
    let requests = Array.from(this.leaveRequests.values());
    
    if (userId) {
      requests = requests.filter(req => req.userId === userId);
    }
    
    if (status) {
      requests = requests.filter(req => req.status === status);
    }
    
    // Sort by timestamp, newest first
    requests.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    
    return requests;
  }
  
  async getLeaveRequestById(id: number): Promise<LeaveRequest | undefined> {
    return this.leaveRequests.get(id);
  }
  
  async createLeaveRequest(insertLeaveRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = this.leaveRequestIdCounter++;
    const leaveRequest = { ...insertLeaveRequest, id };
    this.leaveRequests.set(id, leaveRequest);
    return leaveRequest;
  }
  
  async updateLeaveRequestStatus(id: number, status: string): Promise<LeaveRequest | undefined> {
    const leaveRequest = this.leaveRequests.get(id);
    
    if (!leaveRequest) {
      return undefined;
    }
    
    const updatedLeaveRequest = { ...leaveRequest, status };
    this.leaveRequests.set(id, updatedLeaveRequest);
    return updatedLeaveRequest;
  }
  
  // Report methods
  async getFinancialSummary(userId: number, startDate: string, endDate: string): Promise<any> {
    // Get all meal preferences for this user in the date range
    const allPreferences = Array.from(this.mealPreferences.values()).filter(
      (pref) => {
        if (pref.userId !== userId) return false;
        return pref.date >= startDate && pref.date <= endDate;
      }
    );
    
    // Calculate total charges and refunds
    let totalCharges = 0;
    let totalRefunds = 0;
    
    for (const pref of allPreferences) {
      // Base charge is Rs.225 per day (Rs.75 × 3 meals)
      totalCharges += 225;
      
      // Calculate refunds
      if (pref.fullDayLeave) {
        totalRefunds += 225; // Full day refund
      } else {
        if (!pref.breakfast) totalRefunds += 75;
        if (!pref.lunch) totalRefunds += 75;
        if (!pref.dinner) totalRefunds += 75;
      }
    }
    
    return {
      userId,
      startDate,
      endDate,
      totalCharges,
      totalRefunds,
      netAmount: totalCharges - totalRefunds
    };
  }
  
  async getFoodWastageReport(startDate: string, endDate: string): Promise<any> {
    // Get all meal preferences in the date range
    const allPreferences = Array.from(this.mealPreferences.values()).filter(
      (pref) => pref.date >= startDate && pref.date <= endDate
    );
    
    // Get all users
    const userCount = this.users.size;
    
    // Count meals that would have been wasted
    let breakfastSaved = 0;
    let lunchSaved = 0;
    let dinnerSaved = 0;
    let totalMealsSaved = 0;
    
    for (const pref of allPreferences) {
      if (pref.fullDayLeave) {
        breakfastSaved++;
        lunchSaved++;
        dinnerSaved++;
        totalMealsSaved += 3;
      } else {
        if (!pref.breakfast) {
          breakfastSaved++;
          totalMealsSaved++;
        }
        if (!pref.lunch) {
          lunchSaved++;
          totalMealsSaved++;
        }
        if (!pref.dinner) {
          dinnerSaved++;
          totalMealsSaved++;
        }
      }
    }
    
    return {
      startDate,
      endDate,
      breakfastSaved,
      lunchSaved,
      dinnerSaved,
      totalMealsSaved,
      estimatedCostSaved: totalMealsSaved * 75 // Rs.75 per meal
    };
  }
}

export const storage = new MemStorage();
