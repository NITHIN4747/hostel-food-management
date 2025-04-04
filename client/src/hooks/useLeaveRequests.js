import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
  const [approvedLeaveRequests, setApprovedLeaveRequests] = useState([]);
  const [rejectedLeaveRequests, setRejectedLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, userRole } = useAuth();

  // Fetch leave requests
  useEffect(() => {
    if (!currentUser) return;

    const fetchLeaveRequests = async () => {
      setIsLoading(true);
      try {
        const leaveRequestsRef = collection(db, 'leaveRequests');
        let leaveRequestsQuery;
        
        // For students, only get their own leave requests
        if (userRole === 'student') {
          leaveRequestsQuery = query(
            leaveRequestsRef,
            where('userId', '==', currentUser.uid),
            orderBy('timestamp', 'desc')
          );
        } else {
          // For admins and wardens, get all leave requests
          leaveRequestsQuery = query(
            leaveRequestsRef,
            orderBy('timestamp', 'desc')
          );
        }
        
        const leaveRequestsSnapshot = await getDocs(leaveRequestsQuery);
        const fetchedRequests = [];
        
        for (const docSnapshot of leaveRequestsSnapshot.docs) {
          const data = docSnapshot.data();
          
          // Get student data
          const studentsRef = collection(db, 'users');
          const studentQuery = query(studentsRef, where('uid', '==', data.userId));
          const studentSnapshot = await getDocs(studentQuery);
          
          let studentName = 'Unknown Student';
          let studentId = '';
          let profileImage = '';
          
          if (!studentSnapshot.empty) {
            const studentData = studentSnapshot.docs[0].data();
            studentName = studentData.displayName;
            studentId = studentData.studentId;
            profileImage = studentData.profileImageUrl;
          }
          
          fetchedRequests.push({
            id: docSnapshot.id,
            userId: data.userId,
            studentName,
            studentId,
            profileImage,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            reason: data.reason,
            status: data.status,
            timestamp: data.timestamp.toDate()
          });
        }
        
        setLeaveRequests(fetchedRequests);
        
        // Separate requests by status
        setPendingLeaveRequests(fetchedRequests.filter(req => req.status === 'pending'));
        setApprovedLeaveRequests(fetchedRequests.filter(req => req.status === 'approved'));
        setRejectedLeaveRequests(fetchedRequests.filter(req => req.status === 'rejected'));
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [currentUser, userRole]);

  // Add a new leave request
  const addLeaveRequest = async (requestData) => {
    try {
      const { startDate, endDate, reason } = requestData;
      
      const leaveRequestRef = collection(db, 'leaveRequests');
      
      const docRef = await addDoc(leaveRequestRef, {
        userId: currentUser.uid,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      
      // Add to state with student details
      const newRequest = {
        id: docRef.id,
        userId: currentUser.uid,
        studentName: currentUser.displayName,
        studentId: currentUser.studentId,
        profileImage: currentUser.profileImageUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'pending',
        timestamp: new Date()
      };
      
      setLeaveRequests([newRequest, ...leaveRequests]);
      setPendingLeaveRequests([newRequest, ...pendingLeaveRequests]);
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding leave request:', error);
      throw error;
    }
  };

  // Approve a leave request
  const approveLeaveRequest = async (requestId) => {
    try {
      const leaveRequestRef = doc(db, 'leaveRequests', requestId);
      await updateDoc(leaveRequestRef, {
        status: 'approved'
      });
      
      // Update state
      const updatedRequests = leaveRequests.map(req => 
        req.id === requestId ? { ...req, status: 'approved' } : req
      );
      
      setLeaveRequests(updatedRequests);
      
      // Move from pending to approved
      const request = pendingLeaveRequests.find(req => req.id === requestId);
      if (request) {
        setPendingLeaveRequests(pendingLeaveRequests.filter(req => req.id !== requestId));
        setApprovedLeaveRequests([{ ...request, status: 'approved' }, ...approvedLeaveRequests]);
      }
      
      return true;
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  };

  // Reject a leave request
  const rejectLeaveRequest = async (requestId) => {
    try {
      const leaveRequestRef = doc(db, 'leaveRequests', requestId);
      await updateDoc(leaveRequestRef, {
        status: 'rejected'
      });
      
      // Update state
      const updatedRequests = leaveRequests.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      );
      
      setLeaveRequests(updatedRequests);
      
      // Move from pending to rejected
      const request = pendingLeaveRequests.find(req => req.id === requestId);
      if (request) {
        setPendingLeaveRequests(pendingLeaveRequests.filter(req => req.id !== requestId));
        setRejectedLeaveRequests([{ ...request, status: 'rejected' }, ...rejectedLeaveRequests]);
      }
      
      return true;
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  };

  return { 
    leaveRequests, 
    pendingLeaveRequests, 
    approvedLeaveRequests, 
    rejectedLeaveRequests, 
    addLeaveRequest, 
    approveLeaveRequest, 
    rejectLeaveRequest, 
    isLoading 
  };
}
