import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { 
  Card, 
  CardContent 
} from '../../components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from '../../components/ui/form';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Switch } from '../../components/ui/switch';
import { Calendar } from '../../components/ui/calendar';
import { Check, CalendarIcon } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { cn } from '../../lib/utils';
import { addDays, format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '../../hooks/use-toast';

interface MealPreference {
  date: Date;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  fullDayLeave: boolean;
}

interface MealPreferenceFormProps {
  userId: string;
  onSubmit: (preference: MealPreference) => Promise<void>;
}

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  breakfast: z.boolean().default(true),
  lunch: z.boolean().default(true),
  dinner: z.boolean().default(true),
  fullDayLeave: z.boolean().default(false),
});

const MealPreferenceForm: React.FC<MealPreferenceFormProps> = ({ userId, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pre-set dates for quick selection
  const tomorrow = addDays(new Date(), 1);
  const dayAfterTomorrow = addDays(new Date(), 2);
  const nextWeek = addDays(new Date(), 7);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: tomorrow,
      breakfast: true,
      lunch: true,
      dinner: true,
      fullDayLeave: false,
    },
  });
  
  // Toggle full day leave which disables individual meal options
  const watchFullDayLeave = form.watch('fullDayLeave');
  
  // Handle full day leave toggle
  const handleFullDayLeaveChange = (value: boolean) => {
    form.setValue('fullDayLeave', value);
    
    if (value) {
      // If full day leave is enabled, set all meal preferences to false
      form.setValue('breakfast', false);
      form.setValue('lunch', false);
      form.setValue('dinner', false);
    } else {
      // If full day leave is disabled, reset to default values
      form.setValue('breakfast', true);
      form.setValue('lunch', true);
      form.setValue('dinner', true);
    }
  };
  
  // Handle form submission
  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...values,
        date: values.date,
      });
      
      toast({
        title: 'Meal preferences updated',
        description: `Your meal preferences for ${format(values.date, 'EEEE, MMMM d, yyyy')} have been saved.`,
      });
      
      // Reset form with the next day's date
      form.reset({
        date: addDays(new Date(), 1),
        breakfast: true,
        lunch: true,
        dinner: true,
        fullDayLeave: false,
      });
    } catch (error) {
      console.error('Error saving meal preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save your meal preferences. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <div className="flex justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(tomorrow)}
                          >
                            Tomorrow
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(dayAfterTomorrow)}
                          >
                            Day After
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(nextWeek)}
                          >
                            Next Week
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select a date to set your meal preferences.
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          
          <div className="w-full md:w-1/2">
            <FormField
              control={form.control}
              name="fullDayLeave"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Full Day Absence</FormLabel>
                    <FormDescription>
                      You won't attend any meals on this day
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={handleFullDayLeaveChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="breakfast"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={watchFullDayLeave}
                        />
                      </FormControl>
                      <FormLabel className="font-medium">Breakfast</FormLabel>
                    </div>
                    <FormDescription>
                      {field.value ? (
                        <span className="text-green-600 flex items-center">
                          <Check className="h-4 w-4 mr-1" /> Will attend
                        </span>
                      ) : (
                        <span className="text-red-600">Will not attend</span>
                      )}
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lunch"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={watchFullDayLeave}
                        />
                      </FormControl>
                      <FormLabel className="font-medium">Lunch</FormLabel>
                    </div>
                    <FormDescription>
                      {field.value ? (
                        <span className="text-green-600 flex items-center">
                          <Check className="h-4 w-4 mr-1" /> Will attend
                        </span>
                      ) : (
                        <span className="text-red-600">Will not attend</span>
                      )}
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dinner"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={watchFullDayLeave}
                        />
                      </FormControl>
                      <FormLabel className="font-medium">Dinner</FormLabel>
                    </div>
                    <FormDescription>
                      {field.value ? (
                        <span className="text-green-600 flex items-center">
                          <Check className="h-4 w-4 mr-1" /> Will attend
                        </span>
                      ) : (
                        <span className="text-red-600">Will not attend</span>
                      )}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset({
                date: tomorrow,
                breakfast: true,
                lunch: true,
                dinner: true,
                fullDayLeave: false,
              });
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md mt-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> By indicating your meal preferences, you help reduce food wastage and save ₹75 for each meal you won't attend.
          </p>
        </div>
      </form>
    </Form>
  );
};

export default MealPreferenceForm;