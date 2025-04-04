import { useState, useEffect } from "react";
import { 
  Box, 
  Container, 
  Grid, 
  GridItem, 
  Heading, 
  Text,
  useToast,
  Flex
} from "@chakra-ui/react";
import { 
  FiUsers, 
  FiCheckCircle, 
  FiCalendarX, 
  FiUserCheck, 
  FiAlertTriangle,
  FiCheckSquare,
  FiRefreshCw
} from "react-icons/fi";
import { collection, query, limit, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";
import TopBar from "../../components/layout/TopBar";
import Sidebar from "../../components/layout/Sidebar";
import StatCard from "../../components/dashboard/StatCard";
import MealTrackingCard from "../../components/dashboard/MealTrackingCard";
import AttendanceTrendCard from "../../components/dashboard/AttendanceTrendCard";
import RecentActivityCard, { Activity } from "../../components/dashboard/RecentActivityCard";
import AIVerificationCard from "../../components/dashboard/AIVerificationCard";
import UpcomingLeavesCard, { LeaveRequest } from "../../components/dashboard/UpcomingLeavesCard";
import StudentsAtRiskCard, { StudentAtRisk } from "../../components/dashboard/StudentsAtRiskCard";

const Dashboard = () => {
  const { userData } = useAuth();
  const toast = useToast();
  
  // Stats data
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [onLeave, setOnLeave] = useState(0);
  
  // Selected time range for attendance trend
  const [selectedTimeRange, setSelectedTimeRange] = useState("Last 7 Days");
  const timeRanges = ["Last 7 Days", "Last 30 Days", "This Month"];
  
  // Meal tracking data
  const [mealData, setMealData] = useState({
    breakfast: { count: 0, total: 0, percentage: 0 },
    lunch: { count: 0, total: 0, percentage: 0 },
    dinner: { count: 0, total: 0, percentage: 0 }
  });
  
  // Activities data
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Verification stats
  const [verificationStats, setVerificationStats] = useState([
    { label: "Successful Verifications", value: 94, color: "green" },
    { label: "Failed Verifications", value: 6, color: "red" },
    { label: "System Accuracy", value: 98, color: "teal" }
  ]);
  
  // Upcoming leaves
  const [upcomingLeaves, setUpcomingLeaves] = useState<LeaveRequest[]>([]);
  
  // Students at risk
  const [studentsAtRisk, setStudentsAtRisk] = useState<StudentAtRisk[]>([]);
  
  // Chart data
  const [mealTrendData, setMealTrendData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Breakfast",
        data: [370, 365, 378, 371, 380, 355, 371],
        borderColor: "#ECC94B",
        backgroundColor: "rgba(236, 201, 75, 0.1)",
      },
      {
        label: "Lunch",
        data: [412, 405, 415, 410, 420, 400, 410],
        borderColor: "#4299E1",
        backgroundColor: "rgba(66, 153, 225, 0.1)",
      },
      {
        label: "Dinner",
        data: [405, 410, 408, 415, 400, 395, 405],
        borderColor: "#38B2AC",
        backgroundColor: "rgba(56, 178, 172, 0.1)",
      }
    ]
  });
  
  const [attendanceTrendData, setAttendanceTrendData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Present",
        data: [455, 460, 448, 452, 440, 415, 422],
        backgroundColor: "rgba(72, 187, 120, 0.7)",
        borderRadius: 4,
      },
      {
        label: "Absent",
        data: [32, 27, 39, 35, 47, 72, 65],
        backgroundColor: "rgba(245, 101, 101, 0.7)",
        borderRadius: 4,
      }
    ]
  });
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total students count
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, orderBy("createdAt", "desc"));
        const userSnapshot = await getDocs(userQuery);
        setTotalStudents(userSnapshot.size);
        
        // Get today's date (start and end)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayStart = Timestamp.fromDate(today);
        const todayEnd = Timestamp.fromDate(tomorrow);
        
        // Fetch sample activities
        const activitiesRef = collection(db, "activity_logs");
        const activitiesQuery = query(activitiesRef, orderBy("createdAt", "desc"), limit(5));
        const activitiesSnapshot = await getDocs(activitiesQuery);
        
        const activitiesList: Activity[] = [];
        activitiesSnapshot.forEach((doc) => {
          const data = doc.data();
          let icon = FiUserCheck;
          let iconBg = "blue.100";
          let iconColor = "blue.600";
          
          // Set icon based on activity type
          switch (data.activityType) {
            case "check-in":
              icon = FiUserCheck;
              iconBg = "blue.100";
              iconColor = "blue.600";
              break;
            case "leave-request":
              icon = FiAlertTriangle;
              iconBg = "yellow.100";
              iconColor = "yellow.600";
              break;
            case "meal-update":
              icon = FiCheckSquare;
              iconBg = "green.100";
              iconColor = "green.600";
              break;
            case "absence-alert":
              icon = FiCalendarX;
              iconBg = "red.100";
              iconColor = "red.600";
              break;
            case "system-update":
              icon = FiRefreshCw;
              iconBg = "blue.100";
              iconColor = "blue.600";
              break;
            default:
              break;
          }
          
          activitiesList.push({
            id: doc.id,
            type: data.activityType,
            title: data.title || "Activity",
            description: data.description,
            timestamp: data.createdAt?.toDate 
              ? new Date(data.createdAt.toDate()).toLocaleString()
              : "Just now",
            icon,
            iconBg,
            iconColor
          });
        });
        
        setActivities(activitiesList.length > 0 ? activitiesList : getDummyActivities());
        
        // Sample data for the demo (would be replaced with actual data from Firebase)
        setPresentToday(415);
        setOnLeave(72);
        
        setMealData({
          breakfast: { count: 371, total: 487, percentage: 76 },
          lunch: { count: 410, total: 487, percentage: 84 },
          dinner: { count: 405, total: 487, percentage: 83 }
        });
        
        setUpcomingLeaves(getDummyLeaves());
        setStudentsAtRisk(getDummyStudentsAtRisk());
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error fetching data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchDashboardData();
  }, [toast]);
  
  // Format date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Start AI verification
  const handleStartVerification = () => {
    toast({
      title: "Verification Started",
      description: "Facial recognition verification has been initiated.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle time range change for attendance trend
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    
    // Update chart data based on selected range (dummy data for demo)
    if (range === "Last 30 Days") {
      setAttendanceTrendData({
        ...attendanceTrendData,
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            ...attendanceTrendData.datasets[0],
            data: [1820, 1840, 1790, 1680]
          },
          {
            ...attendanceTrendData.datasets[1],
            data: [128, 108, 158, 268]
          }
        ]
      });
    } else if (range === "This Month") {
      setAttendanceTrendData({
        ...attendanceTrendData,
        labels: ["Week 1", "Week 2", "Week 3", "Current"],
        datasets: [
          {
            ...attendanceTrendData.datasets[0],
            data: [1760, 1840, 1850, 1880]
          },
          {
            ...attendanceTrendData.datasets[1],
            data: [188, 108, 98, 68]
          }
        ]
      });
    } else {
      // Default to Last 7 Days
      setAttendanceTrendData({
        ...attendanceTrendData,
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            ...attendanceTrendData.datasets[0],
            data: [455, 460, 448, 452, 440, 415, 422]
          },
          {
            ...attendanceTrendData.datasets[1],
            data: [32, 27, 39, 35, 47, 72, 65]
          }
        ]
      });
    }
  };
  
  // Contact actions for students at risk
  const handleCallStudent = (studentId: string) => {
    toast({
      title: "Calling Student",
      description: `Initiating call to student ID: ${studentId}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleEmailStudent = (studentId: string) => {
    toast({
      title: "Email Student",
      description: `Preparing email to student ID: ${studentId}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      
      <Box ml={{ base: 0, md: "64" }}>
        <TopBar title="Dashboard" />
        
        <Container maxW="7xl" py="6" px={{ base: "4", md: "6", lg: "8" }}>
          {/* Welcome Section */}
          <Box mb="6">
            <Heading as="h1" size="xl" fontWeight="bold" color="gray.900">
              Welcome back, {userData?.displayName?.split(' ')[0] || 'User'}!
            </Heading>
            <Text color="gray.600">
              Here's what's happening at your hostel today.
            </Text>
          </Box>
          
          {/* Stats Overview */}
          <Grid 
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
            gap="6" 
            mb="8"
          >
            <StatCard 
              title="Total Students" 
              value={totalStudents} 
              icon={FiUsers} 
              iconBg="blue.100" 
              iconColor="blue.600" 
              linkText="View all" 
              linkHref="/users" 
            />
            
            <StatCard 
              title="Present Today" 
              value={presentToday} 
              icon={FiCheckCircle} 
              iconBg="green.100" 
              iconColor="green.600" 
              linkText="View details" 
              linkHref="/attendance" 
            />
            
            <StatCard 
              title="On Leave" 
              value={onLeave} 
              icon={FiCalendarX} 
              iconBg="red.100" 
              iconColor="red.600" 
              linkText="View leaves" 
              linkHref="/leave" 
            />
          </Grid>
          
          {/* Meal Tracking and Attendance Trend */}
          <Grid 
            templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} 
            gap="6" 
            mb="8"
          >
            <MealTrackingCard 
              date={formattedDate}
              meals={[
                { 
                  label: "Breakfast", 
                  count: mealData.breakfast.count, 
                  total: mealData.breakfast.total, 
                  percentage: mealData.breakfast.percentage,
                  color: "#ECC94B" 
                },
                { 
                  label: "Lunch", 
                  count: mealData.lunch.count, 
                  total: mealData.lunch.total, 
                  percentage: mealData.lunch.percentage,
                  color: "#4299E1" 
                },
                { 
                  label: "Dinner", 
                  count: mealData.dinner.count, 
                  total: mealData.dinner.total, 
                  percentage: mealData.dinner.percentage,
                  color: "#38B2AC" 
                }
              ]}
              trendData={mealTrendData}
            />
            
            <AttendanceTrendCard 
              timeRanges={timeRanges}
              selectedRange={selectedTimeRange}
              onRangeChange={handleTimeRangeChange}
              chartData={attendanceTrendData}
            />
          </Grid>
          
          {/* Recent Activity and AI Verification */}
          <Grid 
            templateColumns={{ base: "1fr", lg: "3fr 1fr" }} 
            gap="6" 
            mb="8"
          >
            <RecentActivityCard activities={activities} />
            
            <AIVerificationCard 
              stats={verificationStats}
              onStartVerification={handleStartVerification}
            />
          </Grid>
          
          {/* Upcoming Leaves and Students at Risk */}
          <Grid 
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} 
            gap="6"
          >
            <UpcomingLeavesCard 
              leaves={upcomingLeaves}
              onViewAll={() => window.location.href = "/leave"}
              onApproveSelected={() => {
                toast({
                  title: "Leaves Approved",
                  description: "Selected leave requests have been approved.",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
              }}
            />
            
            <StudentsAtRiskCard 
              students={studentsAtRisk}
              onViewAll={() => window.location.href = "/attendance"}
              onSendBulkNotification={() => {
                toast({
                  title: "Bulk Notification Sent",
                  description: "Notifications have been sent to all at-risk students.",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
              }}
              onCallStudent={handleCallStudent}
              onEmailStudent={handleEmailStudent}
            />
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

// Helper functions to generate dummy data for the demo
const getDummyActivities = (): Activity[] => [
  {
    id: "1",
    type: "check-in",
    title: "Student Check-in Completed",
    description: "86 students checked in for Dinner",
    timestamp: "2 minutes ago",
    icon: FiUserCheck,
    iconBg: "blue.100",
    iconColor: "blue.600"
  },
  {
    id: "2",
    type: "leave-request",
    title: "Leave Request",
    description: "Ananya Patel has requested weekend leave",
    timestamp: "15 minutes ago",
    icon: FiAlertTriangle,
    iconBg: "yellow.100",
    iconColor: "yellow.600"
  },
  {
    id: "3",
    type: "meal-update",
    title: "Meal Attendance Updated",
    description: "Lunch attendance finalized - 410 students",
    timestamp: "1 hour ago",
    icon: FiCheckSquare,
    iconBg: "green.100",
    iconColor: "green.600"
  },
  {
    id: "4",
    type: "absence-alert",
    title: "Absence Alert",
    description: "12 students missed breakfast without notice",
    timestamp: "3 hours ago",
    icon: FiCalendarX,
    iconBg: "red.100",
    iconColor: "red.600"
  },
  {
    id: "5",
    type: "system-update",
    title: "System Update",
    description: "Attendance system synced with hostel database",
    timestamp: "Yesterday",
    icon: FiRefreshCw,
    iconBg: "blue.100",
    iconColor: "blue.600"
  }
];

const getDummyLeaves = (): LeaveRequest[] => [
  {
    id: "1",
    student: {
      id: "s1",
      name: "Ananya Patel",
      room: "B-204"
    },
    dates: {
      start: "May 20",
      end: "May 22",
      duration: "3 days"
    },
    status: "pending"
  },
  {
    id: "2",
    student: {
      id: "s2",
      name: "Arjun Singh",
      room: "A-105"
    },
    dates: {
      start: "May 18",
      end: "May 25",
      duration: "1 week"
    },
    status: "approved"
  },
  {
    id: "3",
    student: {
      id: "s3",
      name: "Nisha Kapoor",
      room: "C-301"
    },
    dates: {
      start: "May 22",
      end: "May 24",
      duration: "3 days"
    },
    status: "approved"
  }
];

const getDummyStudentsAtRisk = (): StudentAtRisk[] => [
  {
    id: "s4",
    name: "Rahul Verma",
    room: "A-102",
    missedMeals: {
      count: 6,
      period: "Last 7 days"
    }
  },
  {
    id: "s5",
    name: "Priya Sharma",
    room: "B-210",
    missedMeals: {
      count: 4,
      period: "Last 7 days"
    }
  },
  {
    id: "s6",
    name: "Vikram Mehta",
    room: "C-305",
    missedMeals: {
      count: 5,
      period: "Last 7 days"
    }
  }
];

export default Dashboard;
