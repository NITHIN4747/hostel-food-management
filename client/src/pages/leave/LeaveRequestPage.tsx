import React from 'react';
import { Layout } from '@/components/layout/Layout';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import LeaveRequestsList from '@/components/leave/LeaveRequestsList';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LeaveRequestPage() {
  const { userData } = useAuth();

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title="Meal Leave Requests">
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Meal Leave Management</h2>
          <p className="text-gray-600">
            Submit and track your meal leave requests. The hostel will automatically adjust your meal charges (Rs.75 per meal) when your requests are approved.
          </p>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submit">Submit Request</TabsTrigger>
            <TabsTrigger value="history">Request History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submit" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <LeaveRequestForm userId={parseInt(userData.uid)} />
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="bg-white rounded-lg shadow p-6">
              <LeaveRequestsList userId={parseInt(userData.uid)} isAdmin={userData.role === 'admin'} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}