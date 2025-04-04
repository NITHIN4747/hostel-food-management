import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useAttendance() {
  const [mealData, setMealData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, userRole } = useAuth();

  // Fetch meal data and recent logs
  useEffect(() => {
    if (!currentUser) return;

    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        // Get attendance data for meal statistics
        const attendanceRef = collection(db, 'attendance');
        let attendanceQuery;
        
        // For students, only get their own attendance
        if (userRole === 'student') {
          attendanceQuery = query(
            attendanceRef,
            where('userId', '==', currentUser.uid),
            orderBy('timestamp', 'desc')
          );
        } else {
          // For admins and wardens, get all attendance data
          attendanceQuery = query(
            attendanceRef,
            orderBy('timestamp', 'desc')
          );
        }
        
        const attendanceSnapshot = await getDocs(attendanceQuery);
        
        // Process data for meal statistics
        const meals = { breakfast: 0, lunch: 0, dinner: 0 };
        const mealCounts = { breakfast: 0, lunch: 0, dinner: 0 };
        const attendanceLogs = [];
        
        // Get today's date in YYYY-MM-DD format for filtering today's meals
        const today = new Date().toISOString().split('T')[0];
        
        attendanceSnapshot.forEach(doc => {
          const data = doc.data();
          
          // Only count attendance for today in the meal statistics
          if (data.date && data.date.startsWith(today)) {
            if (data.mealType in meals && data.status === 'present') {
              meals[data.mealType]++;
            }
            mealCounts[data.mealType]++;
          }
          
          // Add to attendance logs
          attendanceLogs.push({
            id: doc.id,
            studentName: data.studentName,
            studentId: data.studentId,
            roomNumber: data.roomNumber,
            wing: data.wing,
            meal: data.mealType === 'breakfast' ? 'Breakfast' : 
                  data.mealType === 'lunch' ? 'Lunch' : 'Dinner',
            status: data.status,
            timestamp: new Date(data.timestamp.toDate()).toLocaleString(),
            date: data.date
          });
        });
        
        // Calculate percentages for meal attendance
        const mealStats = [
          {
            meal: 'breakfast',
            count: meals.breakfast,
            totalCount: mealCounts.breakfast,
            attendancePercentage: mealCounts.breakfast > 0 ? 
              Math.round((meals.breakfast / mealCounts.breakfast) * 100) : 0,
            date: today
          },
          {
            meal: 'lunch',
            count: meals.lunch,
            totalCount: mealCounts.lunch,
            attendancePercentage: mealCounts.lunch > 0 ? 
              Math.round((meals.lunch / mealCounts.lunch) * 100) : 0,
            date: today
          },
          {
            meal: 'dinner',
            count: meals.dinner,
            totalCount: mealCounts.dinner,
            attendancePercentage: mealCounts.dinner > 0 ? 
              Math.round((meals.dinner / mealCounts.dinner) * 100) : 0,
            date: today
          }
        ];
        
        setMealData(mealStats);
        setRecentLogs(attendanceLogs);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [currentUser, userRole]);

  // Mark attendance for a specific meal
  const markAttendance = async (userId, mealType, status = 'present') => {
    try {
      // Get student data
      const studentsRef = collection(db, 'users');
      const studentQuery = query(studentsRef, where('uid', '==', userId));
      const studentSnapshot = await getDocs(studentQuery);
      
      if (studentSnapshot.empty) {
        throw new Error('Student not found');
      }
      
      const studentData = studentSnapshot.docs[0].data();
      
      // Create attendance record
      const today = new Date().toISOString().split('T')[0];
      
      await addDoc(collection(db, 'attendance'), {
        userId,
        studentName: studentData.displayName,
        studentId: studentData.studentId,
        roomNumber: studentData.roomNumber,
        wing: studentData.wing,
        mealType,
        status,
        date: today,
        timestamp: serverTimestamp()
      });
      
      // Refresh data
      const updatedLogs = [...recentLogs];
      updatedLogs.unshift({
        id: Date.now().toString(), // Temporary ID until refresh
        studentName: studentData.displayName,
        studentId: studentData.studentId,
        roomNumber: studentData.roomNumber,
        wing: studentData.wing,
        meal: mealType === 'breakfast' ? 'Breakfast' : 
              mealType === 'lunch' ? 'Lunch' : 'Dinner',
        status,
        timestamp: new Date().toLocaleString(),
        date: today
      });
      
      setRecentLogs(updatedLogs);
      
      return true;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  };

  // Mark attendance for all students
  const markAttendanceForAll = async (date, mealType) => {
    try {
      // Get all students
      const studentsRef = collection(db, 'users');
      const studentQuery = query(studentsRef, where('role', '==', 'student'));
      const studentSnapshot = await getDocs(studentQuery);
      
      // Get leave requests for today to mark students on leave
      const leaveRef = collection(db, 'leaveRequests');
      const leaveQuery = query(
        leaveRef, 
        where('status', '==', 'approved'),
      );
      const leaveSnapshot = await getDocs(leaveQuery);
      
      const studentsOnLeave = {};
      
      leaveSnapshot.forEach(doc => {
        const leaveData = doc.data();
        const startDate = new Date(leaveData.startDate.toDate());
        const endDate = new Date(leaveData.endDate.toDate());
        const checkDate = new Date(date);
        
        // Check if the date falls within the leave period
        if (checkDate >= startDate && checkDate <= endDate) {
          studentsOnLeave[leaveData.userId] = true;
        }
      });
      
      // Mark attendance for each student
      const attendanceBatch = [];
      
      for (const doc of studentSnapshot.docs) {
        const studentData = doc.data();
        const userId = studentData.uid;
        
        // Determine status - on leave or random present/absent
        let status;
        if (studentsOnLeave[userId]) {
          status = 'on_leave';
        } else {
          // For realistic data, make most students present (85-95% attendance)
          // But this is just for simulation, in a real app this would be actual scanning or checking
          const random = Math.random();
          status = random < 0.9 ? 'present' : 'absent';
        }
        
        // Create attendance record
        attendanceBatch.push(addDoc(collection(db, 'attendance'), {
          userId,
          studentName: studentData.displayName,
          studentId: studentData.studentId,
          roomNumber: studentData.roomNumber,
          wing: studentData.wing,
          mealType,
          status,
          date,
          timestamp: serverTimestamp()
        }));
      }
      
      await Promise.all(attendanceBatch);
      
      // Refresh data
      const attendanceRef = collection(db, 'attendance');
      const refreshQuery = query(
        attendanceRef,
        orderBy('timestamp', 'desc'),
        limit(30)
      );
      
      const refreshSnapshot = await getDocs(refreshQuery);
      const updatedLogs = [];
      
      refreshSnapshot.forEach(doc => {
        const data = doc.data();
        updatedLogs.push({
          id: doc.id,
          studentName: data.studentName,
          studentId: data.studentId,
          roomNumber: data.roomNumber,
          wing: data.wing,
          meal: data.mealType === 'breakfast' ? 'Breakfast' : 
                data.mealType === 'lunch' ? 'Lunch' : 'Dinner',
          status: data.status,
          timestamp: new Date(data.timestamp.toDate()).toLocaleString(),
          date: data.date
        });
      });
      
      setRecentLogs(updatedLogs);
      
      return true;
    } catch (error) {
      console.error('Error marking attendance for all:', error);
      throw error;
    }
  };

  // Get meal statistics for a specific date range
  const getMealStatistics = (startDate, endDate) => {
    // Filter logs for the date range
    const filteredLogs = recentLogs.filter(log => {
      if (!log.date) return false;
      return log.date >= startDate && log.date <= endDate;
    });
    
    // Calculate statistics
    const totalMeals = filteredLogs.length;
    const presentCount = filteredLogs.filter(log => log.status === 'present').length;
    const breakfastLogs = filteredLogs.filter(log => log.meal === 'Breakfast');
    const lunchLogs = filteredLogs.filter(log => log.meal === 'Lunch');
    const dinnerLogs = filteredLogs.filter(log => log.meal === 'Dinner');
    
    const breakfastPresent = breakfastLogs.filter(log => log.status === 'present').length;
    const lunchPresent = lunchLogs.filter(log => log.status === 'present').length;
    const dinnerPresent = dinnerLogs.filter(log => log.status === 'present').length;
    
    // Generate detailed data for the report
    const detailedData = [];
    
    // Create a map of dates in the range
    const dateMap = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = {
        breakfast: { total: 0, present: 0, onLeave: 0 },
        lunch: { total: 0, present: 0, onLeave: 0 },
        dinner: { total: 0, present: 0, onLeave: 0 }
      };
    }
    
    // Fill in the data
    filteredLogs.forEach(log => {
      if (!log.date || !dateMap[log.date]) return;
      
      const mealType = log.meal.toLowerCase();
      dateMap[log.date][mealType].total++;
      
      if (log.status === 'present') {
        dateMap[log.date][mealType].present++;
      } else if (log.status === 'on_leave') {
        dateMap[log.date][mealType].onLeave++;
      }
    });
    
    // Convert to array for the table
    Object.entries(dateMap).forEach(([date, meals]) => {
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        const mealData = meals[meal];
        if (mealData.total > 0) {
          detailedData.push({
            date: new Date(date).toLocaleDateString(),
            meal: meal.charAt(0).toUpperCase() + meal.slice(1),
            studentsPresent: mealData.present,
            attendancePercentage: Math.round((mealData.present / mealData.total) * 100),
            onLeave: mealData.onLeave,
            costSaved: Math.round(((mealData.total - mealData.present) * 40).toFixed(2))
          });
        }
      });
    });
    
    // Sample data for the report
    return {
      totalMeals,
      averageAttendance: totalMeals > 0 ? Math.round((presentCount / totalMeals) * 100) : 0,
      breakfastAttendance: breakfastLogs.length > 0 ? Math.round((breakfastPresent / breakfastLogs.length) * 100) : 0,
      lunchAttendance: lunchLogs.length > 0 ? Math.round((lunchPresent / lunchLogs.length) * 100) : 0,
      dinnerAttendance: dinnerLogs.length > 0 ? Math.round((dinnerPresent / dinnerLogs.length) * 100) : 0,
      potentialSavings: Math.round(((totalMeals - presentCount) * 40).toFixed(2)),
      costPerMeal: 40,
      totalCost: Math.round((presentCount * 40).toFixed(2)),
      studentRefunds: Math.round(((totalMeals - presentCount) * 40).toFixed(2)),
      wasteReduction: Math.round(((totalMeals - presentCount) / totalMeals * 100).toFixed(2)),
      detailedData
    };
  };

  return { 
    mealData, 
    recentLogs, 
    markAttendance, 
    markAttendanceForAll,
    getMealStatistics,
    isLoading 
  };
}
