import { useState } from "react";
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
  useToast
} from "@chakra-ui/react";
import { FiSearch, FiFilter, FiDownload, FiCheck, FiX, FiCamera, FiMoreVertical } from "react-icons/fi";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

interface Student {
  id: string;
  name: string;
  room: string;
  avatar?: string;
  status: "present" | "absent" | "late" | "leave";
  time?: string;
  verificationMethod?: "face" | "manual" | "qr";
}

const AttendanceTracking = () => {
  const toast = useToast();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meal, setMeal] = useState<string>("breakfast");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Mock data for students
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      name: "Rahul Sharma",
      room: "A-101",
      status: "present",
      time: "08:15 AM",
      verificationMethod: "face"
    },
    {
      id: "2",
      name: "Priya Patel",
      room: "B-205",
      status: "present",
      time: "08:23 AM",
      verificationMethod: "qr"
    },
    {
      id: "3",
      name: "Amit Kumar",
      room: "A-110",
      status: "absent"
    },
    {
      id: "4",
      name: "Neha Singh",
      room: "C-304",
      status: "leave"
    },
    {
      id: "5",
      name: "Vikram Mehta",
      room: "B-112",
      status: "late",
      time: "09:05 AM",
      verificationMethod: "manual"
    }
  ]);

  // Filter students based on search query and status filter
  const filteredStudents = students.filter(student => {
    // Apply search filter
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.room.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = filterStatus === "all" || student.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle marking student as present
  const markAsPresent = (studentId: string) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId 
          ? { 
              ...student, 
              status: "present", 
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              verificationMethod: "manual"
            } 
          : student
      )
    );
    
    toast({
      title: "Marked Present",
      description: "Student has been marked as present",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle marking student as absent
  const markAsAbsent = (studentId: string) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId 
          ? { 
              ...student, 
              status: "absent",
              time: undefined,
              verificationMethod: undefined
            } 
          : student
      )
    );
    
    toast({
      title: "Marked Absent",
      description: "Student has been marked as absent",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle face verification
  const startFaceVerification = (studentId: string) => {
    toast({
      title: "Face Verification",
      description: "Starting facial recognition for student verification",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle export
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting ${meal} attendance for ${date}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "green";
      case "absent":
        return "red";
      case "late":
        return "orange";
      case "leave":
        return "purple";
      default:
        return "gray";
    }
  };
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      
      <Box ml={{ base: 0, md: "64" }}>
        <TopBar title="Attendance Tracking" />
        
        <Container maxW="7xl" py="6" px={{ base: "4", md: "6", lg: "8" }}>
          <Flex direction="column" mb="8">
            <Heading as="h1" size="lg" mb="4">
              Attendance Tracking
            </Heading>
            <Text mb="6" color="gray.600">
              Track and manage student attendance for meals
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
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </Select>
              </FormControl>
            </Grid>
            
            <Tabs colorScheme="blue" mb="6">
              <TabList>
                <Tab>Today's Attendance</Tab>
                <Tab>History</Tab>
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
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="leave">On Leave</option>
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
                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
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
                                  icon={<FiCheck />}
                                  size="sm"
                                  colorScheme="green"
                                  variant="ghost"
                                  onClick={() => markAsPresent(student.id)}
                                  isDisabled={student.status === "present"}
                                />
                                <IconButton
                                  aria-label="Mark as absent"
                                  icon={<FiX />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => markAsAbsent(student.id)}
                                  isDisabled={student.status === "absent"}
                                />
                                <IconButton
                                  aria-label="Face verification"
                                  icon={<FiCamera />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => startFaceVerification(student.id)}
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
                                    <MenuItem>Add Note</MenuItem>
                                    <MenuItem>View History</MenuItem>
                                    <MenuItem>Send Notification</MenuItem>
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
                  <Box p="6" bg="white" borderRadius="md" shadow="sm" textAlign="center">
                    <Text color="gray.600">Attendance history and reports will be displayed here.</Text>
                  </Box>
                </TabPanel>
                
                <TabPanel>
                  <Box p="6" bg="white" borderRadius="md" shadow="sm" textAlign="center">
                    <Text color="gray.600">Attendance analytics and insights will be displayed here.</Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default AttendanceTracking;
