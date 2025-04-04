import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [onLeaveCount, setOnLeaveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole } = useAuth();

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // Get all students
        const studentsRef = collection(db, 'users');
        const studentsQuery = query(studentsRef, where('role', '==', 'student'));
        const studentsSnapshot = await getDocs(studentsQuery);
        
        const fetchedStudents = [];
        let totalCount = 0;
        
        for (const docSnapshot of studentsSnapshot.docs) {
          const data = docSnapshot.data();
          totalCount++;
          
          // Get the latest attendance status for each student
          const attendanceRef = collection(db, 'attendance');
          const today = new Date().toISOString().split('T')[0];
          
          const attendanceQuery = query(
            attendanceRef,
            where('userId', '==', data.uid),
            where('date', '==', today)
          );
          
          const attendanceSnapshot = await getDocs(attendanceQuery);
          
          let status = 'unknown';
          let attendancePercentage = 0;
          
          if (!attendanceSnapshot.empty) {
            // Get the most recent attendance entry
            const attendanceEntries = attendanceSnapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id
            }));
            
            // Sort by timestamp descending
            attendanceEntries.sort((a, b) => 
              b.timestamp?.toDate?.() - a.timestamp?.toDate?.()
            );
            
            if (attendanceEntries.length > 0) {
              status = attendanceEntries[0].status;
            }
            
            // Calculate percentage of meals attended
            const totalEntries = attendanceEntries.length;
            const presentEntries = attendanceEntries.filter(entry => 
              entry.status === 'present'
            ).length;
            
            attendancePercentage = totalEntries > 0 ? 
              Math.round((presentEntries / totalEntries) * 100) : 0;
          }
          
          // Determine today's leave status
          const leaveRef = collection(db, 'leaveRequests');
          const leaveQuery = query(
            leaveRef,
            where('userId', '==', data.uid),
            where('status', '==', 'approved')
          );
          
          const leaveSnapshot = await getDocs(leaveQuery);
          
          let onLeave = false;
          
          if (!leaveSnapshot.empty) {
            const todayDate = new Date();
            
            for (const leaveDoc of leaveSnapshot.docs) {
              const leaveData = leaveDoc.data();
              const startDate = leaveData.startDate.toDate();
              const endDate = leaveData.endDate.toDate();
              
              if (todayDate >= startDate && todayDate <= endDate) {
                onLeave = true;
                status = 'on_leave';
                break;
              }
            }
          }
          
          fetchedStudents.push({
            id: docSnapshot.id,
            uid: data.uid,
            displayName: data.displayName,
            email: data.email,
            studentId: data.studentId,
            roomNumber: data.roomNumber,
            wing: data.wing,
            profileImageUrl: data.profileImageUrl,
            status,
            attendancePercentage,
            onLeave
          });
        }
        
        setStudents(fetchedStudents);
        setTotalStudents(totalCount);
        
        // Count today's attendance status
        setPresentCount(
          fetchedStudents.filter(student => student.status === 'present').length
        );
        
        setAbsentCount(
          fetchedStudents.filter(student => student.status === 'absent').length
        );
        
        setOnLeaveCount(
          fetchedStudents.filter(student => student.status === 'on_leave').length
        );
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Add a new student
  const addStudent = async (studentData) => {
    try {
      const { displayName, email, studentId, roomNumber, wing } = studentData;
      
      // Create a default email and password if not provided
      const studentEmail = email || `${studentId.toLowerCase()}@hosteltrack.com`;
      const defaultPassword = 'password123'; // This should be changed by the student later
      
      // Create a new Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        studentEmail,
        defaultPassword
      );
      
      const uid = userCredential.user.uid;
      
      // Add student to Firestore
      await addDoc(collection(db, 'users'), {
        uid,
        displayName,
        email: studentEmail,
        studentId,
        roomNumber,
        wing,
        role: 'student',
        createdAt: serverTimestamp()
      });
      
      // Add to state
      const newStudent = {
        id: Date.now().toString(), // Temporary ID until refresh
        uid,
        displayName,
        email: studentEmail,
        studentId,
        roomNumber,
        wing,
        profileImageUrl: '',
        status: 'unknown',
        attendancePercentage: 0,
        onLeave: false
      };
      
      setStudents([newStudent, ...students]);
      setTotalStudents(totalStudents + 1);
      
      return uid;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  };

  return { 
    students, 
    totalStudents, 
    presentCount, 
    absentCount, 
    onLeaveCount, 
    addStudent, 
    isLoading 
  };
}
