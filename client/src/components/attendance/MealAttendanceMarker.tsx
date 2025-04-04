import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface MealAttendanceMarkerProps {
  userId: string;
  onMarkAttendance: (mealType: string, attended: boolean) => Promise<void>;
}

interface MealStatus {
  type: string;
  title: string;
  time: string;
  status: 'pending' | 'marked' | 'missed' | 'upcoming';
  attended?: boolean;
}

const MealAttendanceMarker: React.FC<MealAttendanceMarkerProps> = ({ userId, onMarkAttendance }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [meals, setMeals] = useState<MealStatus[]>([]);
  
  // Determine meal status based on time of day
  useEffect(() => {
    const getCurrentMealStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      
      // Define meal times
      const breakfastStart = 7;
      const breakfastEnd = 9;
      const lunchStart = 12;
      const lunchEnd = 14;
      const dinnerStart = 19;
      const dinnerEnd = 21;
      
      const updatedMeals: MealStatus[] = [
        {
          type: 'breakfast',
          title: 'Breakfast',
          time: '7:00 - 9:00 AM',
          status: 'missed',
        },
        {
          type: 'lunch',
          title: 'Lunch',
          time: '12:00 - 2:00 PM',
          status: 'upcoming',
        },
        {
          type: 'dinner',
          title: 'Dinner',
          time: '7:00 - 9:00 PM',
          status: 'upcoming',
        },
      ];
      
      // Set status based on current time
      if (hours < breakfastStart) {
        // Before breakfast
        updatedMeals[0].status = 'upcoming';
      } else if (hours >= breakfastStart && hours < breakfastEnd) {
        // During breakfast
        updatedMeals[0].status = 'pending';
      } else if (hours >= breakfastEnd && hours < lunchStart) {
        // After breakfast, before lunch
        updatedMeals[0].status = 'missed';
      } else if (hours >= lunchStart && hours < lunchEnd) {
        // During lunch
        updatedMeals[0].status = 'missed';
        updatedMeals[1].status = 'pending';
      } else if (hours >= lunchEnd && hours < dinnerStart) {
        // After lunch, before dinner
        updatedMeals[0].status = 'missed';
        updatedMeals[1].status = 'missed';
      } else if (hours >= dinnerStart && hours < dinnerEnd) {
        // During dinner
        updatedMeals[0].status = 'missed';
        updatedMeals[1].status = 'missed';
        updatedMeals[2].status = 'pending';
      } else {
        // After dinner
        updatedMeals[0].status = 'missed';
        updatedMeals[1].status = 'missed';
        updatedMeals[2].status = 'missed';
      }
      
      return updatedMeals;
    };
    
    // Set initial status
    setMeals(getCurrentMealStatus());
    
    // Update time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
      setMeals(getCurrentMealStatus());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleMarkAttendance = async (mealType: string, attended: boolean) => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User ID is required to mark attendance',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onMarkAttendance(mealType, attended);
      
      // Update local state
      setMeals(prevMeals => 
        prevMeals.map(meal => 
          meal.type === mealType 
            ? { ...meal, status: 'marked', attended } 
            : meal
        )
      );
      
      toast({
        title: 'Attendance marked!',
        description: `You've marked ${attended ? 'present' : 'absent'} for ${mealType}`,
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark attendance. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusIcon = (meal: MealStatus) => {
    switch (meal.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'marked':
        return meal.attended 
          ? <Check className="h-5 w-5 text-green-500" /> 
          : <X className="h-5 w-5 text-red-500" />;
      case 'missed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'upcoming':
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getStatusBadge = (meal: MealStatus) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'default';
    let label = '';
    
    switch (meal.status) {
      case 'pending':
        variant = 'secondary';
        label = 'Needs Marking';
        break;
      case 'marked':
        variant = meal.attended ? 'secondary' : 'destructive';
        label = meal.attended ? 'Present' : 'Absent';
        break;
      case 'missed':
        variant = 'destructive';
        label = 'Missed';
        break;
      case 'upcoming':
        variant = 'outline';
        label = 'Upcoming';
        break;
    }
    
    return (
      <Badge variant={variant}>
        {label}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Current Time</p>
          <p className="text-lg font-semibold">{format(currentTime, 'h:mm a')}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="text-lg font-semibold">{format(currentTime, 'EEEE, MMMM d')}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {meals.map((meal) => (
          <Card key={meal.type} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="flex items-center p-4 w-full md:w-1/3 bg-gray-50">
                  <div className="mr-3">
                    {getStatusIcon(meal)}
                  </div>
                  <div>
                    <h3 className="font-medium">{meal.title}</h3>
                    <p className="text-sm text-gray-500">{meal.time}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between p-4 w-full md:w-2/3">
                  <div className="mb-3 md:mb-0">
                    {getStatusBadge(meal)}
                  </div>
                  
                  <div className="flex gap-2">
                    {meal.status === 'pending' && (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          disabled={isSubmitting} 
                          onClick={() => handleMarkAttendance(meal.type, true)}
                        >
                          <Check className="h-4 w-4 mr-1" /> I'm Attending
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={isSubmitting} 
                          onClick={() => handleMarkAttendance(meal.type, false)}
                        >
                          <X className="h-4 w-4 mr-1" /> Not Attending
                        </Button>
                      </>
                    )}
                    
                    {meal.status === 'marked' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isSubmitting} 
                        onClick={() => handleMarkAttendance(meal.type, !meal.attended)}
                      >
                        Change Response
                      </Button>
                    )}
                    
                    {meal.status === 'missed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled
                      >
                        Time Elapsed
                      </Button>
                    )}
                    
                    {meal.status === 'upcoming' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled
                      >
                        Not Available Yet
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md mt-6">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> Attendance can only be marked during meal times. You must be physically present at the dining hall when marking yourself as present.
        </p>
      </div>
    </div>
  );
};

export default MealAttendanceMarker;