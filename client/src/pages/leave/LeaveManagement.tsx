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
  FormErrorMessage,
  Textarea,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  HStack,
  VStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Center
} from "@chakra-ui/react";
import { 
  FiPlus, 
  FiCalendar, 
  FiCheck, 
  FiX, 
  FiUser, 
  FiClock,
  FiHome,
  FiMoreVertical,
  FiMessageSquare,
  FiAlertCircle,
  FiFilePlus,
  FiFilter,
  FiDownload
} from "react-icons/fi";
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

interface LeaveRequest {
  id: string;
  userId: string;
  studentName: string;
  room: string;
  avatar?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

const LeaveManagement = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userData, isAdmin, isWarden } = useAuth();
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>("");
  
  // New leave request form
  const [newLeave, setNewLeave] = useState({
    startDate: "",
    endDate: "",
    reason: ""
  });
  
  const [formErrors, setFormErrors] = useState({
    startDate: "",
    endDate: "",
    reason: ""
  });
  
  // Stats for admin/warden
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    currentOnLeave: 0
  });
  
  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        
        const leaveRef = collection(db, "leave_requests");
        let leaveQuery;
        
        if (isAdmin || isWarden) {
          // Admins and wardens can see all leave requests
          leaveQuery = query(
            leaveRef,
            orderBy("createdAt", "desc")
          );
        } else {
          // Students can only see their own leave requests
          leaveQuery = query(
            leaveRef,
            where("userId", "==", userData?.uid),
            orderBy("createdAt", "desc")
          );
        }
        
        const querySnapshot = await getDocs(leaveQuery);
        const leaves: LeaveRequest[] = [];
        
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          
          // Get student details if admin/warden
          let studentName = userData?.displayName || "";
          let room = userData?.hostelRoom || "";
          let avatar = userData?.photoURL || "";
          
          if (isAdmin || isWarden) {
            try {
              const studentDoc = await getDoc(doc(db, "users", data.userId));
              if (studentDoc.exists()) {
                const studentData = studentDoc.data();
                studentName = studentData.displayName;
                room = studentData.hostelRoom || "Unknown";
                avatar = studentData.photoURL || "";
              }
            } catch (error) {
              console.error("Error fetching student data:", error);
            }
          }
          
          // Format dates
          const startDate = data.startDate instanceof Timestamp 
            ? data.startDate.toDate().toISOString().split('T')[0]
            : "";
          
          const endDate = data.endDate instanceof Timestamp 
            ? data.endDate.toDate().toISOString().split('T')[0]
            : "";
          
          const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toLocaleString()
            : new Date().toLocaleString();
          
          leaves.push({
            id: docSnapshot.id,
            userId: data.userId,
            studentName,
            room,
            avatar,
            startDate,
            endDate,
            reason: data.reason,
            status: data.status,
            approvedBy: data.approvedBy,
            notes: data.notes,
            createdAt
          });
        }
        
        setLeaveRequests(leaves);
        setFilteredRequests(leaves);
        
        // Calculate stats
        const now = new Date();
        const total = leaves.length;
        const pending = leaves.filter(l => l.status === "pending").length;
        const approved = leaves.filter(l => l.status === "approved").length;
        const rejected = leaves.filter(l => l.status === "rejected").length;
        const currentOnLeave = leaves.filter(l => {
          if (l.status !== "approved") return false;
          
          const start = new Date(l.startDate);
          const end = new Date(l.endDate);
          end.setHours(23, 59, 59, 999); // Include the full end day
          
          return now >= start && now <= end;
        }).length;
        
        setStats({
          total,
          pending,
          approved,
          rejected,
          currentOnLeave
        });
        
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        toast({
          title: "Error",
          description: "Failed to fetch leave requests",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, [userData, isAdmin, isWarden, toast]);
  
  // Filter leave requests
  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(leaveRequests.filter(leave => leave.status === filterStatus));
    }
  }, [filterStatus, leaveRequests]);
  
  // Handle input change for new leave request
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLeave(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {
      startDate: "",
      endDate: "",
      reason: ""
    };
    let isValid = true;
    
    if (!newLeave.startDate) {
      errors.startDate = "Start date is required";
      isValid = false;
    }
    
    if (!newLeave.endDate) {
      errors.endDate = "End date is required";
      isValid = false;
    }
    
    if (newLeave.startDate && newLeave.endDate) {
      const start = new Date(newLeave.startDate);
      const end = new Date(newLeave.endDate);
      
      if (start > end) {
        errors.endDate = "End date cannot be before start date";
        isValid = false;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        errors.startDate = "Start date cannot be in the past";
        isValid = false;
      }
    }
    
    if (!newLeave.reason) {
      errors.reason = "Reason is required";
      isValid = false;
    } else if (newLeave.reason.length < 10) {
      errors.reason = "Please provide a more detailed reason";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Submit new leave request
  const handleSubmitLeave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const leaveRef = collection(db, "leave_requests");
      const newLeaveData = {
        userId: userData?.uid,
        startDate: Timestamp.fromDate(new Date(newLeave.startDate)),
        endDate: Timestamp.fromDate(new Date(newLeave.endDate)),
        reason: newLeave.reason,
        status: "pending",
        createdAt: Timestamp.fromDate(new Date())
      };
      
      const docRef = await addDoc(leaveRef, newLeaveData);
      
      // Log activity
      await addDoc(collection(db, "activity_logs"), {
        userId: userData?.uid,
        activityType: "leave-request",
        title: "Leave Request Created",
        description: `${userData?.displayName} has requested leave from ${newLeave.startDate} to ${newLeave.endDate}`,
        metadata: { leaveId: docRef.id },
        createdAt: Timestamp.fromDate(new Date())
      });
      
      // Add to local state
      const now = new Date().toLocaleString();
      const newRequest: LeaveRequest = {
        id: docRef.id,
        userId: userData?.uid || "",
        studentName: userData?.displayName || "",
        room: userData?.hostelRoom || "",
        avatar: userData?.photoURL,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        reason: newLeave.reason,
        status: "pending",
        createdAt: now
      };
      
      setLeaveRequests(prev => [newRequest, ...prev]);
      setFilteredRequests(prev => [newRequest, ...prev]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1
      }));
      
      // Reset form
      setNewLeave({
        startDate: "",
        endDate: "",
        reason: ""
      });
      
      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted for approval",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle approve leave
  const handleApproveLeave = async () => {
    if (!selectedLeave) return;
    
    try {
      setLoading(true);
      
      const leaveRef = doc(db, "leave_requests", selectedLeave.id);
      await updateDoc(leaveRef, {
        status: "approved",
        approvedBy: userData?.uid,
        notes: adminNotes
      });
      
      // Log activity
      await addDoc(collection(db, "activity_logs"), {
        userId: userData?.uid,
        activityType: "leave-approval",
        title: "Leave Request Approved",
        description: `Leave request for ${selectedLeave.studentName} has been approved`,
        metadata: { leaveId: selectedLeave.id, studentId: selectedLeave.userId },
        createdAt: Timestamp.fromDate(new Date())
      });
      
      // Update local state
      setLeaveRequests(prev => 
        prev.map(leave => 
          leave.id === selectedLeave.id 
            ? { ...leave, status: "approved", approvedBy: userData?.uid, notes: adminNotes }
            : leave
        )
      );
      
      setFilteredRequests(prev => 
        prev.map(leave => 
          leave.id === selectedLeave.id 
            ? { ...leave, status: "approved", approvedBy: userData?.uid, notes: adminNotes }
            : leave
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1,
        currentOnLeave: isCurrentLeave(selectedLeave) ? prev.currentOnLeave + 1 : prev.currentOnLeave
      }));
      
      toast({
        title: "Leave Approved",
        description: `Leave request for ${selectedLeave.studentName} has been approved`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      setSelectedLeave(null);
      setAdminNotes("");
      
    } catch (error) {
      console.error("Error approving leave:", error);
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle reject leave
  const handleRejectLeave = async () => {
    if (!selectedLeave) return;
    
    try {
      setLoading(true);
      
      const leaveRef = doc(db, "leave_requests", selectedLeave.id);
      await updateDoc(leaveRef, {
        status: "rejected",
        approvedBy: userData?.uid,
        notes: adminNotes
      });
      
      // Log activity
      await addDoc(collection(db, "activity_logs"), {
        userId: userData?.uid,
        activityType: "leave-rejection",
        title: "Leave Request Rejected",
        description: `Leave request for ${selectedLeave.studentName} has been rejected`,
        metadata: { leaveId: selectedLeave.id, studentId: selectedLeave.userId },
        createdAt: Timestamp.fromDate(new Date())
      });
      
      // Update local state
      setLeaveRequests(prev => 
        prev.map(leave => 
          leave.id === selectedLeave.id 
            ? { ...leave, status: "rejected", approvedBy: userData?.uid, notes: adminNotes }
            : leave
        )
      );
      
      setFilteredRequests(prev => 
        prev.map(leave => 
          leave.id === selectedLeave.id 
            ? { ...leave, status: "rejected", approvedBy: userData?.uid, notes: adminNotes }
            : leave
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));
      
      toast({
        title: "Leave Rejected",
        description: `Leave request for ${selectedLeave.studentName} has been rejected`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      
      setSelectedLeave(null);
      setAdminNotes("");
      
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Check if a leave is current
  const isCurrentLeave = (leave: LeaveRequest) => {
    if (leave.status !== "approved") return false;
    
    const now = new Date();
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    end.setHours(23, 59, 59, 999); // Include the full end day
    
    return now >= start && now <= end;
  };
  
  // Calculate duration of leave
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate the difference in days
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };
  
  // Handle leave action click
  const handleLeaveAction = (leave: LeaveRequest, action: "view" | "approve" | "reject") => {
    setSelectedLeave(leave);
    setAdminNotes("");
    
    if (action === "approve" || action === "reject") {
      onOpen();
    }
  };
  
  // Handle export
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Exporting leave requests data",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      
      <Box ml={{ base: 0, md: "64" }}>
        <TopBar title="Leave Management" />
        
        <Container maxW="7xl" py="6" px={{ base: "4", md: "6", lg: "8" }}>
          <Flex direction="column" mb="8">
            <Heading as="h1" size="lg" mb="4">
              Leave Management
            </Heading>
            <Text mb="6" color="gray.600">
              Manage your leave requests and track meal adjustments during absence
            </Text>
            
            {(isAdmin || isWarden) && (
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }} gap="4" mb="6">
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Total Requests</StatLabel>
                      <StatNumber>{stats.total}</StatNumber>
                      <StatHelpText>All time</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Pending</StatLabel>
                      <StatNumber>{stats.pending}</StatNumber>
                      <StatHelpText color="yellow.500">Awaiting approval</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Approved</StatLabel>
                      <StatNumber>{stats.approved}</StatNumber>
                      <StatHelpText color="green.500">All time</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Rejected</StatLabel>
                      <StatNumber>{stats.rejected}</StatNumber>
                      <StatHelpText color="red.500">All time</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody>
                    <Stat>
                      <StatLabel>Currently on Leave</StatLabel>
                      <StatNumber>{stats.currentOnLeave}</StatNumber>
                      <StatHelpText>Active leaves</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </Grid>
            )}
            
            <Tabs colorScheme="blue" mb="6">
              <TabList>
                <Tab>Leave Requests</Tab>
                {!isWarden && !isAdmin && <Tab>My History</Tab>}
                {(isWarden || isAdmin) && <Tab>Reports</Tab>}
              </TabList>
              
              <TabPanels>
                <TabPanel px="0">
                  <Flex justify="space-between" align="center" mb="4" direction={{ base: "column", md: "row" }} gap="4">
                    <Flex gap="4" w={{ base: "100%", md: "auto" }}>
                      <Select 
                        placeholder="Filter by Status" 
                        maxW="200px"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </Select>
                    </Flex>
                    
                    <Flex gap="2">
                      {!isAdmin && !isWarden && (
                        <Button 
                          leftIcon={<FiPlus />} 
                          colorScheme="blue" 
                          onClick={() => {
                            setNewLeave({
                              startDate: "",
                              endDate: "",
                              reason: ""
                            });
                            setFormErrors({
                              startDate: "",
                              endDate: "",
                              reason: ""
                            });
                            onOpen();
                          }}
                        >
                          Request Leave
                        </Button>
                      )}
                      
                      {(isAdmin || isWarden) && (
                        <>
                          <Button 
                            leftIcon={<FiFilter />} 
                            variant="outline"
                          >
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
                        </>
                      )}
                    </Flex>
                  </Flex>
                  
                  {loading ? (
                    <Center p="10">
                      <Spinner size="xl" color="blue.500" thickness="4px" />
                    </Center>
                  ) : filteredRequests.length === 0 ? (
                    <Center p="10" borderWidth="1px" borderRadius="lg">
                      <VStack>
                        <Icon as={FiCalendar} boxSize="12" color="gray.300" />
                        <Text mt="4" fontSize="lg" fontWeight="medium">No leave requests found</Text>
                        <Text color="gray.500">
                          {filterStatus !== "all" 
                            ? `No ${filterStatus} leave requests available`
                            : isAdmin || isWarden 
                              ? "No leave requests have been submitted yet"
                              : "You haven't submitted any leave requests yet"}
                        </Text>
                        {!isAdmin && !isWarden && (
                          <Button 
                            mt="4" 
                            leftIcon={<FiPlus />} 
                            colorScheme="blue"
                            onClick={() => {
                              setNewLeave({
                                startDate: "",
                                endDate: "",
                                reason: ""
                              });
                              setFormErrors({
                                startDate: "",
                                endDate: "",
                                reason: ""
                              });
                              onOpen();
                            }}
                          >
                            Request Leave
                          </Button>
                        )}
                      </VStack>
                    </Center>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>{isAdmin || isWarden ? "Student" : "Request ID"}</Th>
                            <Th>Dates</Th>
                            <Th>Duration</Th>
                            <Th>Reason</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredRequests.map((leave) => (
                            <Tr key={leave.id}>
                              <Td>
                                {isAdmin || isWarden ? (
                                  <Flex align="center">
                                    <Avatar size="sm" name={leave.studentName} src={leave.avatar} mr="3" />
                                    <Box>
                                      <Text fontWeight="medium">{leave.studentName}</Text>
                                      <Text fontSize="sm" color="gray.500">Room {leave.room}</Text>
                                    </Box>
                                  </Flex>
                                ) : (
                                  <Text fontSize="sm" fontFamily="mono">
                                    {leave.id.substring(0, 8)}...
                                  </Text>
                                )}
                              </Td>
                              <Td>
                                <Text>{leave.startDate}</Text>
                                <Text>to</Text>
                                <Text>{leave.endDate}</Text>
                              </Td>
                              <Td>
                                {calculateDuration(leave.startDate, leave.endDate)}
                              </Td>
                              <Td maxW="300px">
                                <Text noOfLines={2}>{leave.reason}</Text>
                              </Td>
                              <Td>
                                <Badge colorScheme={getStatusColor(leave.status)}>
                                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                </Badge>
                                {isCurrentLeave(leave) && (
                                  <Badge ml="2" colorScheme="purple">Current</Badge>
                                )}
                              </Td>
                              <Td>
                                <Flex gap="2">
                                  {isAdmin || isWarden ? (
                                    <>
                                      {leave.status === "pending" && (
                                        <>
                                          <IconButton
                                            aria-label="Approve"
                                            icon={<FiCheck />}
                                            size="sm"
                                            colorScheme="green"
                                            variant="ghost"
                                            onClick={() => handleLeaveAction(leave, "approve")}
                                          />
                                          <IconButton
                                            aria-label="Reject"
                                            icon={<FiX />}
                                            size="sm"
                                            colorScheme="red"
                                            variant="ghost"
                                            onClick={() => handleLeaveAction(leave, "reject")}
                                          />
                                        </>
                                      )}
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
                                          <MenuItem icon={<FiCalendar />}>View Leave History</MenuItem>
                                          <MenuItem icon={<FiHome />}>Check Room Status</MenuItem>
                                          <MenuItem icon={<FiMessageSquare />}>Send Notification</MenuItem>
                                        </MenuList>
                                      </Menu>
                                    </>
                                  ) : (
                                    leave.status === "pending" && (
                                      <Badge colorScheme="blue">Awaiting Response</Badge>
                                    )
                                  )}
                                </Flex>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>
                
                {!isWarden && !isAdmin && (
                  <TabPanel>
                    <Box p="6" bg="white" borderRadius="md" shadow="sm">
                      <Heading size="md" mb="4">Leave Request History</Heading>
                      
                      <HStack spacing="6" mb="6" wrap="wrap">
                        <Box minW="200px">
                          <Text fontWeight="medium" mb="2">Leave Usage Summary</Text>
                          <HStack mb="2">
                            <Text fontSize="sm">Total Requests:</Text>
                            <Text fontSize="sm" fontWeight="medium">{leaveRequests.length}</Text>
                          </HStack>
                          <HStack mb="2">
                            <Text fontSize="sm">Approved:</Text>
                            <Text fontSize="sm" fontWeight="medium">{leaveRequests.filter(l => l.status === "approved").length}</Text>
                          </HStack>
                          <HStack>
                            <Text fontSize="sm">Total Days:</Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {leaveRequests
                                .filter(l => l.status === "approved")
                                .reduce((total, leave) => {
                                  const duration = calculateDuration(leave.startDate, leave.endDate);
                                  return total + parseInt(duration.split(" ")[0]);
                                }, 0)} days
                            </Text>
                          </HStack>
                        </Box>
                        
                        <Divider orientation="vertical" height="100px" />
                        
                        <Box minW="200px">
                          <Text fontWeight="medium" mb="2">Meal Adjustments</Text>
                          <HStack mb="2">
                            <Text fontSize="sm">Meals Skipped:</Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {leaveRequests
                                .filter(l => l.status === "approved")
                                .reduce((total, leave) => {
                                  const days = parseInt(calculateDuration(leave.startDate, leave.endDate).split(" ")[0]);
                                  return total + (days * 3); // 3 meals per day
                                }, 0)} meals
                            </Text>
                          </HStack>
                          <HStack>
                            <Text fontSize="sm">Estimated Savings:</Text>
                            <Text fontSize="sm" fontWeight="medium" color="green.500">
                              ₹{leaveRequests
                                .filter(l => l.status === "approved")
                                .reduce((total, leave) => {
                                  const days = parseInt(calculateDuration(leave.startDate, leave.endDate).split(" ")[0]);
                                  return total + (days * 3 * 40); // 3 meals per day at ₹40 per meal
                                }, 0)}
                            </Text>
                          </HStack>
                        </Box>
                      </HStack>
                      
                      <Divider my="6" />
                      
                      <Text fontWeight="medium" mb="4">Quick Request New Leave</Text>
                      <Flex gap="4" direction={{ base: "column", md: "row" }}>
                        <FormControl isInvalid={!!formErrors.startDate}>
                          <FormLabel>Start Date</FormLabel>
                          <Input 
                            type="date" 
                            name="startDate"
                            value={newLeave.startDate}
                            onChange={handleInputChange}
                          />
                          {formErrors.startDate && <FormErrorMessage>{formErrors.startDate}</FormErrorMessage>}
                        </FormControl>
                        
                        <FormControl isInvalid={!!formErrors.endDate}>
                          <FormLabel>End Date</FormLabel>
                          <Input 
                            type="date" 
                            name="endDate"
                            value={newLeave.endDate}
                            onChange={handleInputChange}
                          />
                          {formErrors.endDate && <FormErrorMessage>{formErrors.endDate}</FormErrorMessage>}
                        </FormControl>
                        
                        <Button 
                          colorScheme="blue" 
                          alignSelf="flex-end" 
                          leftIcon={<FiFilePlus />}
                          onClick={() => {
                            if (newLeave.startDate && newLeave.endDate) {
                              const errors = {
                                startDate: "",
                                endDate: "",
                                reason: ""
                              };
                              
                              const start = new Date(newLeave.startDate);
                              const end = new Date(newLeave.endDate);
                              
                              if (start > end) {
                                errors.endDate = "End date cannot be before start date";
                              }
                              
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              
                              if (start < today) {
                                errors.startDate = "Start date cannot be in the past";
                              }
                              
                              if (!errors.startDate && !errors.endDate) {
                                onOpen();
                              } else {
                                setFormErrors(errors);
                              }
                            } else {
                              if (!newLeave.startDate) {
                                setFormErrors(prev => ({
                                  ...prev,
                                  startDate: "Start date is required"
                                }));
                              }
                              
                              if (!newLeave.endDate) {
                                setFormErrors(prev => ({
                                  ...prev,
                                  endDate: "End date is required"
                                }));
                              }
                            }
                          }}
                        >
                          Request Leave
                        </Button>
                      </Flex>
                    </Box>
                  </TabPanel>
                )}
                
                {(isWarden || isAdmin) && (
                  <TabPanel>
                    <Box p="6" bg="white" borderRadius="md" shadow="sm" textAlign="center">
                      <Text color="gray.600">Leave request reports and analytics will be displayed here.</Text>
                    </Box>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </Flex>
        </Container>
      </Box>
      
      {/* New Leave Request Modal */}
      {!selectedLeave && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Request Leave</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing="4">
                <FormControl isInvalid={!!formErrors.startDate}>
                  <FormLabel>Start Date</FormLabel>
                  <Input 
                    type="date" 
                    name="startDate"
                    value={newLeave.startDate}
                    onChange={handleInputChange}
                  />
                  {formErrors.startDate && <FormErrorMessage>{formErrors.startDate}</FormErrorMessage>}
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.endDate}>
                  <FormLabel>End Date</FormLabel>
                  <Input 
                    type="date" 
                    name="endDate"
                    value={newLeave.endDate}
                    onChange={handleInputChange}
                  />
                  {formErrors.endDate && <FormErrorMessage>{formErrors.endDate}</FormErrorMessage>}
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.reason}>
                  <FormLabel>Reason for Leave</FormLabel>
                  <Textarea 
                    name="reason"
                    value={newLeave.reason}
                    onChange={handleInputChange}
                    placeholder="Please provide a detailed reason for your leave request"
                    rows={4}
                  />
                  {formErrors.reason && <FormErrorMessage>{formErrors.reason}</FormErrorMessage>}
                </FormControl>
                
                <Box w="full">
                  <Text fontSize="sm" color="gray.600" mb="2">
                    Leave Summary:
                  </Text>
                  
                  {newLeave.startDate && newLeave.endDate && new Date(newLeave.startDate) <= new Date(newLeave.endDate) ? (
                    <HStack spacing="4" p="3" bg="blue.50" rounded="md">
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">Duration:</Text>
                        <Text fontSize="sm">{calculateDuration(newLeave.startDate, newLeave.endDate)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">Meals:</Text>
                        <Text fontSize="sm">{parseInt(calculateDuration(newLeave.startDate, newLeave.endDate).split(" ")[0]) * 3} meals</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">Adjustment:</Text>
                        <Text fontSize="sm" color="green.500">
                          ₹{parseInt(calculateDuration(newLeave.startDate, newLeave.endDate).split(" ")[0]) * 3 * 40}
                        </Text>
                      </Box>
                    </HStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      Select valid dates to see leave summary
                    </Text>
                  )}
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue"
                onClick={handleSubmitLeave}
                isLoading={loading}
              >
                Submit Request
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      
      {/* Approve/Reject Leave Modal */}
      {selectedLeave && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedLeave.status === "pending" ? "Review Leave Request" : "Leave Request Details"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing="4" align="stretch">
                <Box>
                  <Flex align="center" mb="4">
                    <Avatar size="md" name={selectedLeave.studentName} src={selectedLeave.avatar} mr="3" />
                    <Box>
                      <Text fontWeight="medium">{selectedLeave.studentName}</Text>
                      <Text fontSize="sm" color="gray.500">Room {selectedLeave.room}</Text>
                    </Box>
                  </Flex>
                  
                  <Grid templateColumns="1fr 1fr" gap="4" mb="4">
                    <Box>
                      <Text fontSize="sm" color="gray.600">Start Date</Text>
                      <Text fontWeight="medium">{selectedLeave.startDate}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">End Date</Text>
                      <Text fontWeight="medium">{selectedLeave.endDate}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Duration</Text>
                      <Text fontWeight="medium">{calculateDuration(selectedLeave.startDate, selectedLeave.endDate)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Status</Text>
                      <Badge colorScheme={getStatusColor(selectedLeave.status)}>
                        {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                      </Badge>
                    </Box>
                  </Grid>
                  
                  <Box mb="4">
                    <Text fontSize="sm" color="gray.600">Reason for Leave</Text>
                    <Text>{selectedLeave.reason}</Text>
                  </Box>
                  
                  <Box p="3" bg="blue.50" rounded="md" mb="4">
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">Meal Adjustment</Text>
                        <Text fontSize="sm">{parseInt(calculateDuration(selectedLeave.startDate, selectedLeave.endDate).split(" ")[0]) * 3} meals will be skipped</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color="green.500">
                          ₹{parseInt(calculateDuration(selectedLeave.startDate, selectedLeave.endDate).split(" ")[0]) * 3 * 40} potential adjustment
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                  
                  {selectedLeave.status === "pending" && (
                    <FormControl>
                      <FormLabel>Admin Notes</FormLabel>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add any notes about this leave request (optional)"
                        rows={3}
                      />
                    </FormControl>
                  )}
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              
              {selectedLeave.status === "pending" && (
                <>
                  <Button 
                    colorScheme="red" 
                    variant="outline" 
                    mr={3}
                    leftIcon={<FiX />}
                    onClick={handleRejectLeave}
                    isLoading={loading}
                  >
                    Reject
                  </Button>
                  <Button 
                    colorScheme="green"
                    leftIcon={<FiCheck />}
                    onClick={handleApproveLeave}
                    isLoading={loading}
                  >
                    Approve
                  </Button>
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default LeaveManagement;
