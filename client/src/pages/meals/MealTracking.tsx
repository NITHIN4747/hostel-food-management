import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Input,
  Select,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  Progress,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from "@chakra-ui/react";
import { 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiCamera, 
  FiMoreVertical, 
  FiPlus,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertTriangle,
  FiCalendar,
  FiUser,
  FiRefreshCw
} from "react-icons/fi";
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

interface StudentMeal {
  id: string;
  userId: string;
  name: string;
  room: string;
  avatar?: string;
  status: "attended" | "missed" | "pending" | "late";
  time?: string;
  verificationMethod?: "face" | "manual" | "qr" | null;
}

const MealTracking = () => {
  const toast = useToast();
  const { userData, isAdmin, isWarden } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<string>("breakfast");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<StudentMeal[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentMeal | null>(null);
  
  const [stats, setStats] = useState({
    total: 0,
    attended: 0,
    missed: 0,
    pending: 0,
    attendanceRate: 0
  });

  // Fetch meal attendance data
  useEffect(() => {
    const fetchMealAttendance = async () => {
      try {
        setLoading(true);
        
        // Convert date string to Date objects for Firestore query
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Query meal attendance collection
        const mealRef = collection(db, "meal_attendance");
        const mealQuery = query(
          mealRef,
          where("date", ">=", Timestamp.fromDate(selectedDate)),
          where("date", "<", Timestamp.fromDate(nextDay)),
          where("mealType", "==", mealType),
          orderBy("date", "desc")
        );
        
        const mealSnapshot = await getDocs(mealQuery);
        const mealData: StudentMeal[] = [];
        
        // Query users collection to get student details
        const usersRef = collection(db, "users");
        const usersQuery = query(
          usersRef,
          where("role", "==", "student")
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        // Create a map of user IDs to user data
        const userMap = new Map();
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          userMap.set(doc.id, userData);
        });
        
        // Process meal attendance data
        mealSnapshot.forEach((doc) => {
          const data = doc.data();
          const user = userMap.get(data.userId);
          
          if (user) {
            mealData.push({
              id: doc.id,
              userId: data.userId,
              name: user.displayName,
              room: user.hostelRoom || "Unknown",
              avatar: user.photoURL,
              status: data.attended ? "attended" : "missed",
              time: data.date?.toDate ? new Date(data.date.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
              verificationMethod: data.verificationMethod
            });
          }
        });
        
        // Add students who don't have attendance records yet
        userMap.forEach((user, userId) => {
          // Check if this user already has an attendance record for this meal
          const exists = mealData.some(meal => meal.userId === userId);
          
          if (!exists && user.role === "student") {
            mealData.push({
              id: `pending-${userId}`,
              userId: userId,
              name: user.displayName,
              room: user.hostelRoom || "Unknown",
              avatar: user.photoURL,
              status: "pending",
              verificationMethod: null
            });
          }
        });
        
        setStudents(mealData);
        
        // Calculate stats
        const total = mealData.length;
        const attended = mealData.filter(s => s.status === "attended").length;
        const missed = mealData.filter(s => s.status === "missed").length;
        const pending = mealData.filter(s => s.status === "pending").length;
        const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;
        
        setStats({
          total,
          attended,
          missed,
          pending,
          attendanceRate
        });
        
      } catch (error) {
        console.error("Error fetching meal attendance:", error);
        toast({
          title: "Error",
          description: "Failed to fetch meal attendance data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMealAttendance();
  }, [date, mealType, toast]);

  // Filter students based on search query and status filter
  const filteredStudents = students.filter(student => {
    // Apply search filter
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.room.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = filterStatus === "all" || student.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle marking student as attended
  const markAsAttended = async (student: StudentMeal) => {
    try {
      setLoading(true);
      
      const now = new Date();
      
      if (student.id.startsWith("pending-")) {
        // Create new attendance record
        const mealRef = collection(db, "meal_attendance");
        const newMeal = {
          userId: student.userId,
          date: Timestamp.fromDate(now),
          mealType: mealType,
          attended: true,
          verificationMethod: "manual",
          verifiedBy: userData?.uid || null,
          notes: ""
        };
        
        const docRef = await addDoc(mealRef, newMeal);
        
        // Log activity
        await addDoc(collection(db, "activity_logs"), {
          userId: userData?.uid,
          activityType: "meal-attendance",
          title: "Meal Attendance Recorded",
          description: `${student.name} was marked present for ${mealType}`,
          metadata: { mealId: docRef.id, mealType, studentId: student.userId },
          createdAt: Timestamp.fromDate(now)
        });
        
        // Update local state
        setStudents(prevStudents => 
          prevStudents.map(s => 
            s.id === student.id 
              ? { 
                  ...s, 
                  id: docRef.id,
                  status: "attended", 
                  time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  verificationMethod: "manual"
                } 
              : s
          )
        );
        
      } else {
        // Update existing attendance record
        const mealRef = doc(db, "meal_attendance", student.id);
        await updateDoc(mealRef, {
          attended: true,
          verificationMethod: "manual",
          verifiedBy: userData?.uid || null,
          date: Timestamp.fromDate(now)
        });
        
        // Log activity
        await addDoc(collection(db, "activity_logs"), {
          userId: userData?.uid,
          activityType: "meal-attendance-update",
          title: "Meal Attendance Updated",
          description: `${student.name}'s attendance for ${mealType} was updated to present`,
          metadata: { mealId: student.id, mealType, studentId: student.userId },
          createdAt: Timestamp.fromDate(now)
        });
        
        // Update local state
        setStudents(prevStudents => 
          prevStudents.map(s => 
            s.id === student.id 
              ? { 
                  ...s, 
                  status: "attended", 
                  time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  verificationMethod: "manual"
                } 
              : s
          )
        );
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        attended: prev.attended + 1,
        pending: student.status === "pending" ? prev.pending - 1 : prev.pending,
        missed: student.status === "missed" ? prev.missed - 1 : prev.missed,
        attendanceRate: Math.round(((prev.attended + 1) / prev.total) * 100)
      }));
      
      toast({
        title: "Marked Present",
        description: `${student.name} has been marked as present for ${mealType}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle marking student as missed
  const markAsMissed = async (student: StudentMeal) => {
    try {
      setLoading(true);
      
      const now = new Date();
      
      if (student.id.startsWith("pending-")) {
        // Create new attendance record
        const mealRef = collection(db, "meal_attendance");
        const newMeal = {
          userId: student.userId,
          date: Timestamp.fromDate(now),
          mealType: mealType,
          attended: false,
          verificationMethod: "manual",
          verifiedBy: userData?.uid || null,
          notes: ""
        };
        
        const docRef = await addDoc(mealRef, newMeal);
        
        // Log activity
        await addDoc(collection(db, "activity_logs"), {
          userId: userData?.uid,
          activityType: "meal-attendance",
          title: "Meal Attendance Recorded",
          description: `${student.name} was marked absent for ${mealType}`,
          metadata: { mealId: docRef.id, mealType, studentId: student.userId },
          createdAt: Timestamp.fromDate(now)
        });
        
        // Update local state
        setStudents(prevStudents => 
          prevStudents.map(s => 
            s.id === student.id 
              ? { 
                  ...s, 
                  id: docRef.id,
                  status: "missed", 
                  verificationMethod: "manual"
                } 
              : s
          )
        );
        
      } else {
        // Update existing attendance record
        const mealRef = doc(db, "meal_attendance", student.id);
        await updateDoc(mealRef, {
          attended: false,
          verificationMethod: "manual",
          verifiedBy: userData?.uid || null,
          date: Timestamp.fromDate(now)
        });
        
        // Log activity
        await addDoc(collection(db, "activity_logs"), {
          userId: userData?.uid,
          activityType: "meal-attendance-update",
          title: "Meal Attendance Updated",
          description: `${student.name}'s attendance for ${mealType} was updated to absent`,
          metadata: { mealId: student.id, mealType, studentId: student.userId },
          createdAt: Timestamp.fromDate(now)
        });
        
        // Update local state
        setStudents(prevStudents => 
          prevStudents.map(s => 
            s.id === student.id 
              ? { 
                  ...s, 
                  status: "missed", 
                  time: undefined,
                  verificationMethod: "manual"
                } 
              : s
          )
        );
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        missed: prev.missed + 1,
        pending: student.status === "pending" ? prev.pending - 1 : prev.pending,
        attended: student.status === "attended" ? prev.attended - 1 : prev.attended,
        attendanceRate: Math.round(((prev.attended - (student.status === "attended" ? 1 : 0)) / prev.total) * 100)
      }));
      
      toast({
        title: "Marked Absent",
        description: `${student.name} has been marked as absent for ${mealType}`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle face verification
  const startFaceVerification = (student: StudentMeal) => {
    setSelectedStudent(student);
    onOpen();
  };
  
  // Handle face verification confirmation
  const confirmFaceVerification = async () => {
    if (!selectedStudent) return;
    
    try {
      setLoading(true);
      
      const now = new Date();
      
      if (selectedStudent.id.startsWith("pending-")) {
        // Create new attendance record
        const mealRef = collection(db, "meal_attendance");
        const newMeal = {
          userId: selectedStudent.userId,
          date: Timestamp.fromDate(now),
          mealType: mealType,
          attended: true,
          verificationMethod: "face",
          verifiedBy: userData?.uid || null,
          notes: "Verified by facial recognition"
        };
        
        const docRef = await addDoc(mealRef, newMeal);
        
        // Log activity
        await addDoc(collection(db, "activity_logs"), {
          userId: userData?.uid,
          activityType: "face-verification",
          title: "Face Verification Success",
          description: `${selectedStudent.name} was verified by facial recognition for ${mealType}`,
          metadata: { mealId: docRef.id, mealType, studentId: selectedStudent.userId },
          createdAt: Timestamp.fromDate(now)
        });
        
        // Update local state
        setStudents(prevStudents => 
          prevStudents.map(s => 
            s.id === selectedStudent.id 
              ? { 
                  ...s, 
                  id: docRef.id,
                  status: "attended", 
                  time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  verificationMethod: "face"
                } 
              : s
          )
        );
        
      } else {
        // Update existing attendance record
        const mealRef = doc(db, "meal_attendance", selectedStudent.id);
        await updateDoc(mealRef, {
          attended: true,
          verificationMethod: "face",
          verifiedBy: userData?.uid || null,
          date: Timestamp.fromDate(now)
        });
        
        // Log activity
        await addDoc(collection(db, "activity_logs"), {
          userId: userData?.uid,
          activityType: "face-verification",
          title: "Face Verification Success",
          description: `${selectedStudent.name} was verified by facial recognition for ${mealType}`,
          metadata: { mealId: selectedStudent.id, mealType, studentId: selectedStudent.userId },
          createdAt: Timestamp.fromDate(now)
        });
        
        // Update local state
        setStudents(prevStudents => 
          prevStudents.map(s => 
            s.id === selectedStudent.id 
              ? { 
                  ...s, 
                  status: "attended", 
                  time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  verificationMethod: "face"
                } 
              : s
          )
        );
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        attended: prev.attended + (selectedStudent.status !== "attended" ? 1 : 0),
        pending: selectedStudent.status === "pending" ? prev.pending - 1 : prev.pending,
        missed: selectedStudent.status === "missed" ? prev.missed - 1 : prev.missed,
        attendanceRate: Math.round(((prev.attended + (selectedStudent.status !== "attended" ? 1 : 0)) / prev.total) * 100)
      }));
      
      toast({
        title: "Verification Successful",
        description: `${selectedStudent.name} has been verified and marked present`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      
    } catch (error) {
      console.error("Error processing face verification:", error);
      toast({
        title: "Error",
        description: "Face verification failed",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle export
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting ${mealType} attendance for ${date}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "attended":
        return "green";
      case "missed":
        return "red";
      case "late":
        return "orange";
      case "pending":
        return "gray";
      default:
        return "gray";
    }
  };
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      
      <Box ml={{ base: 0, md: "64" }}>
        <TopBar title="Meal Tracking" />
        
        <Container maxW="7xl" py="6" px={{ base: "4", md: "6", lg: "8" }}>
          <Flex direction="column" mb="8">
            <Heading as="h1" size="lg" mb="4">
              Meal Tracking
            </Heading>
            <Text mb="6" color="gray.600">
              Track and manage student meal attendance to reduce food waste
            </Text>
            
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4" mb="6">
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Meal</FormLabel>
                <Select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap="4" mb="6">
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Students</StatLabel>
                    <StatNumber>{stats.total}</StatNumber>
                    <StatHelpText>Registered for meals</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Present</StatLabel>
                    <StatNumber>{stats.attended}</StatNumber>
                    <StatHelpText color="green.500">
                      {stats.attendanceRate}% attendance rate
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Absent</StatLabel>
                    <StatNumber>{stats.missed}</StatNumber>
                    <StatHelpText color="red.500">
                      {stats.total > 0 ? Math.round((stats.missed / stats.total) * 100) : 0}% absence rate
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Pending</StatLabel>
                    <StatNumber>{stats.pending}</StatNumber>
                    <StatHelpText>
                      Not yet recorded
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </Grid>
            
            <Tabs colorScheme="blue" mb="6">
              <TabList>
                <Tab>Attendance</Tab>
                <Tab>Kitchen Planning</Tab>
                <Tab>Analytics</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px="0">
                  <Flex justify="space-between" align="center" mb="4" direction={{ base: "column", md: "row" }} gap="4">
                    <Flex gap="4" w={{ base: "100%", md: "auto" }}>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <FiSearch color="gray.300" />
                        </InputLeftElement>
                        <Input 
                          placeholder="Search students..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </InputGroup>
                      
                      <Select 
                        placeholder="All Status" 
                        maxW="200px"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="attended">Present</option>
                        <option value="missed">Absent</option>
                        <option value="pending">Pending</option>
                        <option value="late">Late</option>
                      </Select>
                    </Flex>
                    
                    <Flex gap="2">
                      <Button leftIcon={<FiFilter />} variant="outline">
                        Filter
                      </Button>
                      <Button 
                        leftIcon={<FiDownload />} 
                        colorScheme="blue" 
                        variant="outline"
                        onClick={handleExport}
                      >
                        Export
                      </Button>
                    </Flex>
                  </Flex>
                  
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Student</Th>
                          <Th>Status</Th>
                          <Th>Time</Th>
                          <Th>Verification</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredStudents.map((student) => (
                          <Tr key={student.id}>
                            <Td>
                              <Flex align="center">
                                <Avatar size="sm" name={student.name} src={student.avatar} mr="3" />
                                <Box>
                                  <Text fontWeight="medium">{student.name}</Text>
                                  <Text fontSize="sm" color="gray.500">Room {student.room}</Text>
                                </Box>
                              </Flex>
                            </Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(student.status)}>
                                {student.status === "attended" ? "Present" : 
                                 student.status === "missed" ? "Absent" : 
                                 student.status === "late" ? "Late" : "Pending"}
                              </Badge>
                            </Td>
                            <Td>{student.time || "-"}</Td>
                            <Td>
                              {student.verificationMethod 
                                ? student.verificationMethod.charAt(0).toUpperCase() + student.verificationMethod.slice(1)
                                : "-"}
                            </Td>
                            <Td>
                              <Flex gap="2">
                                <IconButton
                                  aria-label="Mark as present"
                                  icon={<FiCheckCircle />}
                                  size="sm"
                                  colorScheme="green"
                                  variant="ghost"
                                  onClick={() => markAsAttended(student)}
                                  isDisabled={student.status === "attended" || loading}
                                />
                                <IconButton
                                  aria-label="Mark as absent"
                                  icon={<FiXCircle />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => markAsMissed(student)}
                                  isDisabled={student.status === "missed" || loading}
                                />
                                <IconButton
                                  aria-label="Face verification"
                                  icon={<FiCamera />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => startFaceVerification(student)}
                                  isDisabled={loading}
                                />
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    aria-label="More options"
                                    icon={<FiMoreVertical />}
                                    size="sm"
                                    variant="ghost"
                                  />
                                  <MenuList>
                                    <MenuItem icon={<FiUser />}>View Student Details</MenuItem>
                                    <MenuItem icon={<FiCalendar />}>View Attendance History</MenuItem>
                                    <MenuItem icon={<FiAlertTriangle />}>Report Issue</MenuItem>
                                  </MenuList>
                                </Menu>
                              </Flex>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
                
                <TabPanel>
                  <Card mb="6">
                    <CardHeader>
                      <Heading size="md">Kitchen Planning for {date} - {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Heading>
                    </CardHeader>
                    <CardBody>
                      <Text mb="4">
                        Based on current attendance data and historical patterns, here's the recommended meal preparation:
                      </Text>
                      
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6">
                        <Box>
                          <Heading size="sm" mb="3">Expected Attendance</Heading>
                          <HStack mb="2">
                            <Text fontWeight="medium">Attendance rate:</Text>
                            <Text>{stats.attendanceRate}%</Text>
                          </HStack>
                          <HStack mb="2">
                            <Text fontWeight="medium">Expected students:</Text>
                            <Text>{stats.attended + Math.round(stats.pending * 0.8)}</Text>
                          </HStack>
                          <HStack>
                            <Text fontWeight="medium">Adjustment factor:</Text>
                            <Tag colorScheme="blue">1.05x (5% buffer)</Tag>
                          </HStack>
                        </Box>
                        
                        <Box>
                          <Heading size="sm" mb="3">Preparation Progress</Heading>
                          <Text mb="2" fontSize="sm">Meal preparation should be set for {Math.ceil((stats.attended + Math.round(stats.pending * 0.8)) * 1.05)} students</Text>
                          <HStack mb="2">
                            <Text fontSize="sm" minW="100px">Main course:</Text>
                            <Progress value={70} size="sm" colorScheme="green" flex="1" />
                            <Text fontSize="sm">70%</Text>
                          </HStack>
                          <HStack mb="2">
                            <Text fontSize="sm" minW="100px">Side dishes:</Text>
                            <Progress value={85} size="sm" colorScheme="green" flex="1" />
                            <Text fontSize="sm">85%</Text>
                          </HStack>
                          <HStack mb="2">
                            <Text fontSize="sm" minW="100px">Desserts:</Text>
                            <Progress value={40} size="sm" colorScheme="yellow" flex="1" />
                            <Text fontSize="sm">40%</Text>
                          </HStack>
                        </Box>
                      </Grid>
                      
                      <Flex justify="flex-end" mt="4">
                        <Button leftIcon={<FiRefreshCw />} colorScheme="blue" size="sm">
                          Update Kitchen Status
                        </Button>
                      </Flex>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <Heading size="md">Food Waste Prevention</Heading>
                    </CardHeader>
                    <CardBody>
                      <Text mb="4">
                        Historical data shows that properly tracking attendance can reduce food waste by up to 30%. 
                        Below are the current waste reduction metrics:
                      </Text>
                      
                      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="4" mb="4">
                        <Stat>
                          <StatLabel>Weekly Waste Reduction</StatLabel>
                          <StatNumber>28%</StatNumber>
                          <StatHelpText color="green.500">+5% from last week</StatHelpText>
                        </Stat>
                        
                        <Stat>
                          <StatLabel>Monthly Savings</StatLabel>
                          <StatNumber>₹15,450</StatNumber>
                          <StatHelpText color="green.500">Reduced food costs</StatHelpText>
                        </Stat>
                        
                        <Stat>
                          <StatLabel>Environmental Impact</StatLabel>
                          <StatNumber>205 kg</StatLabel>
                          <StatHelpText color="green.500">CO₂ emissions avoided</StatHelpText>
                        </Stat>
                      </Grid>
                    </CardBody>
                  </Card>
                </TabPanel>
                
                <TabPanel>
                  <Box p="6" bg="white" borderRadius="md" shadow="sm" textAlign="center">
                    <Text color="gray.600">Meal attendance analytics and insights will be displayed here.</Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </Container>
      </Box>
      
      {/* Face Verification Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Face Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" align="center" justify="center" py="4">
              <Avatar 
                size="xl" 
                name={selectedStudent?.name} 
                src={selectedStudent?.avatar} 
                mb="4" 
              />
              <Text fontSize="lg" fontWeight="medium" mb="2">
                {selectedStudent?.name}
              </Text>
              <Text fontSize="sm" color="gray.600" mb="4">
                Room {selectedStudent?.room}
              </Text>
              
              <Box w="100%" h="200px" bg="gray.100" mb="4" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.500">Camera feed would appear here</Text>
              </Box>
              
              <Text fontSize="sm" color="gray.600" textAlign="center" mb="4">
                Position the student's face in the frame for facial recognition verification.
              </Text>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              leftIcon={<FiCheckCircle />} 
              onClick={confirmFaceVerification}
              isLoading={loading}
            >
              Verify Identity
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MealTracking;
