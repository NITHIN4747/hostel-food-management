import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarIcon, PieChart as PieChartIcon, BarChart as BarChartIcon, IndianRupee, Info, Users, Utensils } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';

// Sample colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState<string>('day');
  const [selectedOption, setSelectedOption] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [wastageData, setWastageData] = useState<any[]>([]);
  const [mealPreferences, setMealPreferences] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalStudents: 0,
    activeUsers: 0,
    kitchenStaff: 0,
    admins: 0
  });

  useEffect(() => {
    // In a real app, these would be API calls
    
    // Sample attendance data 
    setAttendanceData([
      { name: 'Monday', breakfast: 180, lunch: 200, dinner: 190 },
      { name: 'Tuesday', breakfast: 200, lunch: 198, dinner: 189 },
      { name: 'Wednesday', breakfast: 190, lunch: 208, dinner: 200 },
      { name: 'Thursday', breakfast: 210, lunch: 215, dinner: 180 },
      { name: 'Friday', breakfast: 195, lunch: 200, dinner: 170 },
      { name: 'Saturday', breakfast: 150, lunch: 180, dinner: 200 },
      { name: 'Sunday', breakfast: 170, lunch: 190, dinner: 210 },
    ]);
    
    // Sample financial data
    setFinancialData([
      { name: 'Jan', collected: 150000, refunded: 15000 },
      { name: 'Feb', collected: 145000, refunded: 12000 },
      { name: 'Mar', collected: 155000, refunded: 18000 },
      { name: 'Apr', collected: 158000, refunded: 16000 },
      { name: 'May', collected: 149000, refunded: 14000 },
      { name: 'Jun', collected: 152000, refunded: 17000 },
    ]);
    
    // Sample wastage data
    setWastageData([
      { name: 'Breakfast', value: 35, fullLabel: 'Breakfast: 35%' },
      { name: 'Lunch', value: 40, fullLabel: 'Lunch: 40%' },
      { name: 'Dinner', value: 25, fullLabel: 'Dinner: 25%' },
    ]);
    
    // Sample meal preferences
    setMealPreferences([
      { name: 'Idli & Sambar', count: 150 },
      { name: 'Dosa', count: 120 },
      { name: 'Paratha', count: 80 },
      { name: 'Chapati Curry', count: 110 },
      { name: 'Rice & Dal', count: 140 },
    ]);
    
    // Sample user stats
    setUserStats({
      totalStudents: 245,
      activeUsers: 230,
      kitchenStaff: 8,
      admins: 3
    });
    
  }, [selectedView, selectedOption]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive overview of hostel meal system</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.activeUsers} active users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Collection</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{financialData.length > 0 ? financialData[financialData.length - 1].collected.toLocaleString() : 0}</div>
              <p className="text-xs text-muted-foreground">
                ₹{financialData.length > 0 ? financialData[financialData.length - 1].refunded.toLocaleString() : 0} refunded
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">215</div>
              <p className="text-xs text-muted-foreground">
                30 absent students
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Food Wastage</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12%</div>
              <p className="text-xs text-muted-foreground">
                5% decrease from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meal Attendance</CardTitle>
                  <CardDescription>Weekly attendance breakdown</CardDescription>
                </div>
                <Select defaultValue="week" onValueChange={(value) => setSelectedView(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={attendanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="breakfast" stroke="#8884d8" name="Breakfast" />
                    <Line type="monotone" dataKey="lunch" stroke="#82ca9d" name="Lunch" />
                    <Line type="monotone" dataKey="dinner" stroke="#ffc658" name="Dinner" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Monthly fee collection vs refunds</CardDescription>
                </div>
                <Select defaultValue="halfYear" onValueChange={(value) => setSelectedOption(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="halfYear">Half Year</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={financialData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Area type="monotone" dataKey="collected" stackId="1" stroke="#8884d8" fill="#8884d8" name="Collected" />
                    <Area type="monotone" dataKey="refunded" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Refunded" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Food Wastage Analysis</CardTitle>
              <CardDescription>Distribution by meal type</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-60 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wastageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ fullLabel }) => fullLabel}
                    >
                      {wastageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Menu Items</CardTitle>
              <CardDescription>Most preferred items this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mealPreferences}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>All system users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 'AD001', name: 'John Doe', role: 'Admin', email: 'john@ksrce.ac.in', status: 'Active' },
                    { id: 'KS001', name: 'Jane Smith', role: 'Kitchen', email: 'jane@ksrce.ac.in', status: 'Active' },
                    { id: 'ST001', name: 'Alex Johnson', role: 'Student', email: 'alex@ksrce.ac.in', status: 'Active' },
                    { id: 'KS002', name: 'Emily Davis', role: 'Kitchen', email: 'emily@ksrce.ac.in', status: 'Inactive' },
                    { id: 'ST002', name: 'Michael Brown', role: 'Student', email: 'michael@ksrce.ac.in', status: 'Active' },
                  ].map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === 'Admin' ? 'default' : 
                          user.role === 'Kitchen' ? 'secondary' : 
                          'outline'
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Previous</Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
            </div>
            <Button variant="outline">Next</Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}