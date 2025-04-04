import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaveRequest } from '@shared/schema';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface LeaveRequestsListProps {
  userId: number;
  isAdmin?: boolean;
}

export default function LeaveRequestsList({ userId, isAdmin = false }: LeaveRequestsListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch leave requests for this user (or all if admin)
  const { data: leaveRequests, isLoading, error } = useQuery({
    queryKey: isAdmin ? ['/api/leave-requests'] : ['/api/leave-requests', userId],
    queryFn: async () => {
      const url = isAdmin
        ? '/api/leave-requests'
        : `/api/leave-requests?userId=${userId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }
      
      return response.json();
    }
  });

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await apiRequest(`/api/leave-requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      // Invalidate the query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/leave-requests'] });
      
      toast({
        title: "Status updated",
        description: `Request has been ${status}`,
      });
    } catch (error) {
      console.error('Error updating leave request status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update request status",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock size={14} />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle size={14} />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle size={14} />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle size={14} />
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading leave requests...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        Error loading leave requests. Please try again.
      </div>
    );
  }

  if (!leaveRequests || leaveRequests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No leave requests found.
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isAdmin ? 'All Leave Requests' : 'Your Leave Requests'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaveRequests.map((request: LeaveRequest) => (
            <div 
              key={request.id} 
              className="border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium capitalize">
                    {request.mealType} on {format(parseISO(request.date), 'PPP')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Submitted on {format(parseISO(request.timestamp.toString()), 'PPP')}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="mt-2 text-sm border-t pt-2">
                <strong>Reason:</strong> {request.reason}
              </div>

              {isAdmin && request.status === 'pending' && (
                <div className="mt-4 flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate(request.id, 'approved')}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}