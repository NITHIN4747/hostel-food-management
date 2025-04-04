import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarIcon, IndianRupee, Utensils, PieChart, Clock, CheckCircle, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MealPreferenceForm from '@/components/attendance/MealPreferenceForm';
import MealAttendanceMarker from '@/components/attendance/MealAttendanceMarker';
import { format } from 'date-fns';
import { Layout } from '@/components/layout/Layout';

interface FinancialSummary {
  totalCharges: number;
  totalRefunds: number;
  netAmount: number;
  savedPercentage: number;
  monthlyData: Array<{
    name: string;
    saved: number;
    spent: number;
  }>;
}

interface MealStats {
  totalMeals: number;
  attendedMeals: number;
  skippedMeals: number;
  attendanceRate: number;
  weeklyData: Array<{
    day: string;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  }>;
}

interface TodaysMeal {
  type: string;
  time: string;
  items: string[];
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function StudentDashboard() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [date, setDate] = useState<Date>(new Date());
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalCharges: 6750, // Rs. 225 per day * 30 days
    totalRefunds: 1125, // Example value
    netAmount: 5625,
    savedPercentage: 16.67, // (1125 / 6750) * 100
    monthlyData: [
      { name: 'Jan', saved: 975, spent: 5775 },
      { name: 'Feb', saved: 1050, spent: 5700 },
      { name: 'Mar', saved: 825, spent: 5925 },
      { name: 'Apr', saved: 1275, spent: 5475 },
      { name: 'May', saved: 1125, spent: 5625 },
      { name: 'Jun', saved: 900, spent: 5850 },
    ]
  });
  
  const [mealStats, setMealStats] = useState<MealStats>({
    totalMeals: 90, // 30 days * 3 meals
    attendedMeals: 75,
    skippedMeals: 15,
    attendanceRate: 83.33, // (75 / 90) * 100
    weeklyData: [
      { day: 'Mon', breakfast: true, lunch: true, dinner: true },
      { day: 'Tue', breakfast: true, lunch: false, dinner: true },
      { day: 'Wed', breakfast: false, lunch: true, dinner: true },
      { day: 'Thu', breakfast: true, lunch: true, dinner: false },
      { day: 'Fri', breakfast: true, lunch: true, dinner: true },
      { day: 'Sat', breakfast: false, lunch: true, dinner: false },
      { day: 'Sun', breakfast: true, lunch: false, dinner: true },
    ]
  });

  const [todaysMeals, setTodaysMeals] = useState<TodaysMeal[]>([
    {
      type: 'Breakfast',
      time: '7:30 AM - 9:00 AM',
      items: ['Idli', 'Sambar', 'Coconut Chutney', 'Tea/Coffee'],
      nutritionInfo: {
        calories: 350,
        protein: 12,
        carbs: 60,
        fat: 8
      }
    },
    {
      type: 'Lunch',
      time: '12:30 PM - 2:00 PM',
      items: ['Rice', 'Dal', 'Mixed Vegetable Curry', 'Curd', 'Pickle'],
      nutritionInfo: {
        calories: 620,
        protein: 18,
        carbs: 85,
        fat: 15
      }
    },
    {
      type: 'Dinner',
      time: '7:30 PM - 9:00 PM',
      items: ['Chapati', 'Paneer Butter Masala', 'Salad', 'Sweet'],
      nutritionInfo: {
        calories: 580,
        protein: 22,
        carbs: 65,
        fat: 18
      }
    }
  ]);

  // Placeholder functions for meal marking and preference setting
  const handleMarkAttendance = async (mealType: string, attended: boolean) => {
    console.log(`Marking ${mealType} attendance as ${attended ? 'attended' : 'not attended'}`);
    // In a real app, you would make an API call to update attendance
  };

  const handleMealPreferenceSubmit = async (preference: any) => {
    console.log('Meal preference submitted:', preference);
    // In a real app, you would make an API call to save preferences
  };

  const handleMealFeedback = (mealType: string, rating: number) => {
    console.log(`Feedback for ${mealType}: ${rating}/5 stars`);
    // In a real app, you would make an API call to save the feedback
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Find the next meal for the day based on current time
  const getCurrentMeal = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 9) return todaysMeals[0]; // Breakfast
    if (hour < 14) return todaysMeals[1]; // Lunch
    return todaysMeals[2]; // Dinner
  };

  const currentMeal = getCurrentMeal();

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Hello, {userData?.displayName || 'Student'}!</h1>
            <p className="text-muted-foreground">{userData?.hostelRoom ? `Room: ${userData.hostelRoom}` : 'Welcome to your meal dashboard'}</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
        </div>

        {/* Next Meal Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-xl text-blue-800">Next Meal: {currentMeal.type}</CardTitle>
                <CardDescription className="text-blue-600 flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4" />
                  {currentMeal.time}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                Today's Menu
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2 text-blue-800">Menu Items</h3>
                <ul className="list-disc pl-5 space-y-1 text-blue-700">
                  {currentMeal.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="default" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleMarkAttendance(currentMeal.type.toLowerCase(), true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Leave Feedback
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-blue-800">Nutrition Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-blue-600">Calories</div>
                    <div className="text-lg font-bold text-blue-800">{currentMeal.nutritionInfo.calories} kcal</div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-blue-600">Protein</div>
                    <div className="text-lg font-bold text-blue-800">{currentMeal.nutritionInfo.protein}g</div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-blue-600">Carbs</div>
                    <div className="text-lg font-bold text-blue-800">{currentMeal.nutritionInfo.carbs}g</div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-blue-600">Fat</div>
                    <div className="text-lg font-bold text-blue-800">{currentMeal.nutritionInfo.fat}g</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="summary" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="w-full grid grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="summary">Dashboard</TabsTrigger>
            <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="preferences">Meal Preferences</TabsTrigger>
            <TabsTrigger value="history">History & Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5" />
                      Financial Summary
                    </CardTitle>
                    <Badge variant="outline">This Month</Badge>
                  </div>
                  <CardDescription>Current month savings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Charges</span>
                      <span className="font-semibold">₹{financialSummary.totalCharges}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Refunds</span>
                      <span className="font-semibold text-green-600">₹{financialSummary.totalRefunds}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-4">
                      <span className="text-muted-foreground">Net Amount</span>
                      <span className="font-bold text-lg">₹{financialSummary.netAmount}</span>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="text-green-800">
                        You've saved {financialSummary.savedPercentage}% on your meal charges this month by marking your preferences!
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={financialSummary.monthlyData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Legend />
                        <Bar dataKey="saved" stackId="a" fill="#22c55e" name="Saved" />
                        <Bar dataKey="spent" stackId="a" fill="#3b82f6" name="Spent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Meal Statistics
                    </CardTitle>
                    <Badge variant="outline">This Month</Badge>
                  </div>
                  <CardDescription>Current month meal tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Meals</span>
                      <span className="font-semibold">{mealStats.totalMeals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Attended Meals</span>
                      <span className="font-semibold text-green-600">{mealStats.attendedMeals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Skipped Meals</span>
                      <span className="font-semibold text-orange-600">{mealStats.skippedMeals}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-4">
                      <span className="text-muted-foreground">Attendance Rate</span>
                      <span className="font-bold text-lg">{mealStats.attendanceRate}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${mealStats.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={mealStats.weeklyData.map(day => ({
                          ...day,
                          breakfast: day.breakfast ? 1 : 0,
                          lunch: day.lunch ? 1 : 0,
                          dinner: day.dinner ? 1 : 0
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 1]} tickCount={2} hide />
                        <Tooltip 
                          formatter={(value: any) => value === 1 ? 'Present' : 'Absent'} 
                          labelFormatter={(label) => `${label}:`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="breakfast" stroke="#8884d8" name="Breakfast" />
                        <Line type="monotone" dataKey="lunch" stroke="#82ca9d" name="Lunch" />
                        <Line type="monotone" dataKey="dinner" stroke="#ffc658" name="Dinner" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {/* Today's Menu Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Today's Complete Menu
                </CardTitle>
                <CardDescription>All meals for {format(date, 'EEEE, MMMM d, yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {todaysMeals.map((meal, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{meal.type}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meal.time}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {meal.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="flex justify-between text-xs text-muted-foreground">
                        <span>{meal.nutritionInfo.calories} kcal</span>
                        <span>{meal.nutritionInfo.protein}g protein</span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mark Today's Meal Attendance</CardTitle>
                <CardDescription>
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MealAttendanceMarker 
                  userId={userData?.uid || ''} 
                  onMarkAttendance={handleMarkAttendance}
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 items-start text-sm">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Note</Badge>
                  <span>You will receive a refund of ₹75 for each meal you mark as "Not Attending" in advance.</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">Important</Badge>
                  <span>Attendance must be marked before the meal service starts.</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-6">
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
              <CardFooter className="flex flex-col space-y-2 items-start text-sm">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Info</Badge>
                  <span>Setting preferences helps the kitchen plan better and reduces food waste.</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Savings</Badge>
                  <span>You will save ₹75 per meal when you mark as "Not Attending" in advance.</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Meal Attendance History</CardTitle>
                <CardDescription>Your past meal attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breakfast</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lunch</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dinner</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { date: '2023-06-01', breakfast: true, lunch: false, dinner: true, savings: 75 },
                        { date: '2023-06-02', breakfast: true, lunch: true, dinner: true, savings: 0 },
                        { date: '2023-06-03', breakfast: false, lunch: true, dinner: false, savings: 150 },
                        { date: '2023-06-04', breakfast: true, lunch: false, dinner: true, savings: 75 },
                        { date: '2023-06-05', breakfast: false, lunch: false, dinner: true, savings: 150 },
                      ].map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.breakfast ? (
                              <span className="text-green-600">Attended</span>
                            ) : (
                              <span className="text-red-600">Absent</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.lunch ? (
                              <span className="text-green-600">Attended</span>
                            ) : (
                              <span className="text-red-600">Absent</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.dinner ? (
                              <span className="text-green-600">Attended</span>
                            ) : (
                              <span className="text-red-600">Absent</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {record.savings > 0 ? (
                              <span className="text-green-600">₹{record.savings}</span>
                            ) : (
                              <span>₹0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Previous Month</Button>
                <Button variant="outline">Next Month</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}