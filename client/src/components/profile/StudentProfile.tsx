import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentProfile() {
  const { userData } = useAuth();
  
  const { data: mealStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/student/meal-stats'],
    queryFn: () => apiRequest('/api/student/meal-stats'),
    enabled: !!userData,
  });
  
  const { data: attendanceHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/student/attendance-history'],
    queryFn: () => apiRequest('/api/student/attendance-history'),
    enabled: !!userData,
  });

  if (!userData) {
    return <div>Loading...</div>;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Student Profile</CardTitle>
          <CardDescription>Your personal information and meal statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={userData.displayName} />
                <AvatarFallback className="text-xl">{getInitials(userData.displayName)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{userData.displayName}</h3>
                <p className="text-sm text-gray-500">{userData.email}</p>
                <Badge variant="outline" className="mt-2">{userData.role}</Badge>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard 
                title="Hostel Room" 
                value={userData.hostelRoom || 'Not Assigned'} 
                description="Your assigned room" 
              />
              <InfoCard 
                title="Total Meals Attended" 
                value={statsLoading ? <Skeleton className="h-7 w-20" /> : mealStats?.totalAttended || '0'} 
                description="Meals attended this semester" 
              />
              <InfoCard 
                title="Total Savings" 
                value={statsLoading ? <Skeleton className="h-7 w-20" /> : `₹${mealStats?.totalSavings || '0'}`} 
                description="Amount saved this semester" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meal History & Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="history">
            <TabsList className="mb-4">
              <TabsTrigger value="history">Attendance History</TabsTrigger>
              <TabsTrigger value="nutrition">Nutritional Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              {historyLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : attendanceHistory?.length ? (
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saving</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(attendanceHistory || []).map((record, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.mealType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.attended ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.attended ? '-' : '₹75'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No meal attendance history found.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="nutrition">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Your meal nutritional information and dietary tracking will appear here.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NutritionCard 
                    title="Average Calories" 
                    value="2150" 
                    target="2200" 
                    unit="kcal"
                  />
                  <NutritionCard 
                    title="Average Protein" 
                    value="65" 
                    target="70" 
                    unit="g"
                  />
                  <NutritionCard 
                    title="Average Carbs" 
                    value="280" 
                    target="300" 
                    unit="g"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  value: React.ReactNode;
  description: string;
}

function InfoCard({ title, value, description }: InfoCardProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

interface NutritionCardProps {
  title: string;
  value: string;
  target: string;
  unit: string;
}

function NutritionCard({ title, value, target, unit }: NutritionCardProps) {
  const percentage = Math.min(100, Math.round((parseInt(value) / parseInt(target)) * 100));
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-1 text-2xl font-semibold">{value} <span className="text-sm font-normal">{unit}</span></div>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="mt-1 text-xs text-gray-500">Target: {target} {unit}</p>
    </div>
  );
}