import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus, X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';

// Sample data for now - will be replaced with API calls
const MEAL_COLORS = {
  breakfast: '#FF8042',
  lunch: '#0088FE',
  dinner: '#00C49F',
};

export default function KitchenDashboard() {
  const { userData } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedMeal, setSelectedMeal] = useState<string>('breakfast');
  const [newMenuItem, setNewMenuItem] = useState<string>('');
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [foodWastageData, setFoodWastageData] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, fetch these from API
    setCurrentItems(['Idli', 'Sambar', 'Coconut Chutney', 'Tea/Coffee']);
    
    // Sample attendance data 
    setAttendanceData([
      { name: 'Present', value: 155, color: '#00C49F' },
      { name: 'Absent', value: 45, color: '#FF8042' },
    ]);
    
    // Sample food wastage data
    setFoodWastageData([
      { name: 'Breakfast', saved: 25, wasted: 5 },
      { name: 'Lunch', saved: 30, wasted: 10 },
      { name: 'Dinner', saved: 15, wasted: 8 },
    ]);
  }, [date, selectedMeal]);

  const addMenuItem = () => {
    if (newMenuItem.trim()) {
      setCurrentItems([...currentItems, newMenuItem.trim()]);
      setNewMenuItem('');
    }
  };

  const removeMenuItem = (index: number) => {
    const newItems = [...currentItems];
    newItems.splice(index, 1);
    setCurrentItems(newItems);
  };

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
            <h1 className="text-3xl font-bold">Kitchen Supervisor Dashboard</h1>
            <p className="text-muted-foreground">Manage meal items and view attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Student Attendance</CardTitle>
              <CardDescription>Today's meal attendance stats</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <Badge variant="outline" className="flex gap-2 items-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00C49F' }}></div>
                  <span>Present: 155</span>
                </Badge>
                <Badge variant="outline" className="flex gap-2 items-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF8042' }}></div>
                  <span>Absent: 45</span>
                </Badge>
              </div>
            </CardFooter>
          </Card>

          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Food Wastage Analysis</CardTitle>
              <CardDescription>Saved meals vs. wasted portions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={foodWastageData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="saved" name="Saved Meals" stackId="a" fill="#00C49F" />
                    <Bar dataKey="wasted" name="Food Wasted" stackId="a" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meal Management</CardTitle>
            <CardDescription>Configure meal items and view student preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="breakfast" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="breakfast" 
                  onClick={() => setSelectedMeal('breakfast')}
                >
                  Breakfast
                </TabsTrigger>
                <TabsTrigger 
                  value="lunch" 
                  onClick={() => setSelectedMeal('lunch')}
                >
                  Lunch
                </TabsTrigger>
                <TabsTrigger 
                  value="dinner" 
                  onClick={() => setSelectedMeal('dinner')}
                >
                  Dinner
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="breakfast" className="space-y-4">
                <div className="flex flex-col gap-4 mt-4">
                  <h3 className="text-lg font-medium">Today's Breakfast Menu</h3>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add new menu item" 
                      value={newMenuItem}
                      onChange={(e) => setNewMenuItem(e.target.value)}
                    />
                    <Button onClick={addMenuItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{item}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeMenuItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="lunch" className="space-y-4">
                <div className="flex flex-col gap-4 mt-4">
                  <h3 className="text-lg font-medium">Today's Lunch Menu</h3>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add new menu item" 
                      value={newMenuItem}
                      onChange={(e) => setNewMenuItem(e.target.value)}
                    />
                    <Button onClick={addMenuItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{item}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeMenuItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="dinner" className="space-y-4">
                <div className="flex flex-col gap-4 mt-4">
                  <h3 className="text-lg font-medium">Today's Dinner Menu</h3>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add new menu item" 
                      value={newMenuItem}
                      onChange={(e) => setNewMenuItem(e.target.value)}
                    />
                    <Button onClick={addMenuItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{item}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeMenuItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Tracking</CardTitle>
            <CardDescription>Today's students present</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Hostel Room</TableHead>
                    <TableHead>Breakfast</TableHead>
                    <TableHead>Lunch</TableHead>
                    <TableHead>Dinner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: '2021CS001', name: 'John Doe', room: 'A-101', breakfast: true, lunch: true, dinner: false },
                    { id: '2021CS002', name: 'Jane Smith', room: 'B-205', breakfast: false, lunch: true, dinner: true },
                    { id: '2021CS003', name: 'Alex Johnson', room: 'A-110', breakfast: true, lunch: false, dinner: true },
                    { id: '2021CS004', name: 'Sarah Williams', room: 'B-304', breakfast: true, lunch: true, dinner: true },
                    { id: '2021CS005', name: 'Michael Brown', room: 'A-115', breakfast: false, lunch: false, dinner: false },
                  ].map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.room}</TableCell>
                      <TableCell>
                        {student.breakfast ? (
                          <span className="flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-1" /> Present
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600">
                            <X className="h-4 w-4 mr-1" /> Absent
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.lunch ? (
                          <span className="flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-1" /> Present
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600">
                            <X className="h-4 w-4 mr-1" /> Absent
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.dinner ? (
                          <span className="flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-1" /> Present
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600">
                            <X className="h-4 w-4 mr-1" /> Absent
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Previous Day</Button>
            <Button variant="outline">Next Day</Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}