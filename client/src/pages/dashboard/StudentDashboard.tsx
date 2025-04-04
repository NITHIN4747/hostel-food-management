import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import MealPreferenceForm from '../../components/attendance/MealPreferenceForm';
import MealAttendanceMarker from '../../components/attendance/MealAttendanceMarker';
import { format } from 'date-fns';

interface FinancialSummary {
  totalCharges: number;
  totalRefunds: number;
  netAmount: number;
  savedPercentage: number;
}

interface MealStats {
  totalMeals: number;
  attendedMeals: number;
  skippedMeals: number;
  attendanceRate: number;
}

const StudentDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [date, setDate] = useState<Date>(new Date());
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalCharges: 6750, // Rs. 225 per day * 30 days
    totalRefunds: 1125, // Example value
    netAmount: 5625,
    savedPercentage: 16.67, // (1125 / 6750) * 100
  });
  const [mealStats, setMealStats] = useState<MealStats>({
    totalMeals: 90, // 30 days * 3 meals
    attendedMeals: 75,
    skippedMeals: 15,
    attendanceRate: 83.33, // (75 / 90) * 100
  });

  // Placeholder functions for meal marking and preference setting
  const handleMarkAttendance = async (mealType: string, attended: boolean) => {
    console.log(`Marking ${mealType} attendance as ${attended ? 'attended' : 'not attended'}`);
    // In a real app, you would make an API call to update attendance
  };

  const handleMealPreferenceSubmit = async (preference: any) => {
    console.log('Meal preference submitted:', preference);
    // In a real app, you would make an API call to save preferences
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Welcome, {userData?.displayName || 'Student'}!
      </h1>
      
      <Tabs defaultValue="summary" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
          <TabsTrigger value="preferences">Meal Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Current month savings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Charges</span>
                    <span className="font-semibold">₹{financialSummary.totalCharges}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Refunds</span>
                    <span className="font-semibold text-green-600">₹{financialSummary.totalRefunds}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-gray-600">Net Amount</span>
                    <span className="font-bold text-lg">₹{financialSummary.netAmount}</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-green-800">
                      You've saved {financialSummary.savedPercentage}% on your meal charges this month by marking your preferences!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Meal Statistics</CardTitle>
                <CardDescription>Current month meal tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Meals</span>
                    <span className="font-semibold">{mealStats.totalMeals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Attended Meals</span>
                    <span className="font-semibold text-green-600">{mealStats.attendedMeals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Skipped Meals</span>
                    <span className="font-semibold text-orange-600">{mealStats.skippedMeals}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-gray-600">Attendance Rate</span>
                    <span className="font-bold text-lg">{mealStats.attendanceRate}%</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${mealStats.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Mark Today's Meal Attendance</CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MealAttendanceMarker 
                userId={userData?.uid || ''} 
                onMarkAttendance={handleMarkAttendance}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Set Meal Preferences</CardTitle>
              <CardDescription>
                Mark which meals you'll be attending in advance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MealPreferenceForm 
                userId={userData?.uid || ''} 
                onSubmit={handleMealPreferenceSubmit}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;