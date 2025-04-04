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
  InputGroup,
  InputLeftElement,
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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Switch,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
import { 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiUser, 
  FiMail,
  FiFilter,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiUpload,
  FiDownload,
  FiKey
} from "react-icons/fi";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  addDoc, 
  Timestamp,
  startAfter,
  limit
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail, 
  deleteUser, 
  getAuth
} from "firebase/auth";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "admin" | "warden" | "student";
  hostelRoom?: string;
  createdAt: string;
  status: "active" | "inactive";
}

const UserManagement = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userData, isAdmin } = useAuth();
  const auth = getAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // New user form
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "student",
    hostelRoom: ""
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    displayName: "",
    hostelRoom: ""
  });
  
  // Alert dialog for deletion
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    wardens: 0,
    admins: 0,
    active: 0,
    inactive: 0
  });
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      
      try {
        setLoading(true);
        
        const usersRef = collection(db, "users");
        const usersQuery = query(
          usersRef,
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(usersQuery);
        const usersList: User[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toLocaleString()
            : new Date().toLocaleString();
          
          usersList.push({
            id: doc.id,
            uid: data.uid,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            role: data.role,
            hostelRoom: data.hostelRoom,
            createdAt,
            status: data.status || "active"
          });
        });
        
        setUsers(usersList);
        setFilteredUsers(usersList);
        
        // Calculate stats
        const total = usersList.length;
        const students = usersList.filter(user => user.role === "student").length;
        const wardens = usersList.filter(user => user.role === "warden").length;
        const admins = usersList.filter(user => user.role === "admin").length;
        const active = usersList.filter(user => user.status === "active").length;
        const inactive = usersList.filter(user => user.status === "inactive").length;
        
        setStats({
          total,
          students,
          wardens,
          admins,
          active,
          inactive
        });
        
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [isAdmin, toast]);
  
  // Apply filters
  useEffect(() => {
    let result = users;
    
    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(user => user.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => 
          user.displayName.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query) ||
          (user.hostelRoom && user.hostelRoom.toLowerCase().includes(query))
      );
    }
    
    setFilteredUsers(result);
  }, [users, roleFilter, statusFilter, searchQuery]);
  
  // Handle input change for new user form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
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
      email: "",
      password: "",
      displayName: "",
      hostelRoom: ""
    };
    let isValid = true;
    
    // Email validation
    if (!newUser.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }
    
    // Password validation (only for new users)
    if (!isEditMode) {
      if (!newUser.password) {
        errors.password = "Password is required";
        isValid = false;
      } else if (newUser.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
        isValid = false;
      }
    }
    
    // Display name validation
    if (!newUser.displayName) {
      errors.displayName = "Name is required";
      isValid = false;
    }
    
    // Hostel room validation (only for students)
    if (newUser.role === "student" && !newUser.hostelRoom) {
      errors.hostelRoom = "Hostel room is required for students";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Create new user
  const handleCreateUser = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      
      // Update user profile
      await updateProfile(userCredential.user, {
        displayName: newUser.displayName,
      });
      
      // Create user document in Firestore
      const usersRef = collection(db, "users");
      const userData = {
        uid: userCredential.user.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        hostelRoom: newUser.hostelRoom || "",
        photoURL: "",
        createdAt: Timestamp.fromDate(new Date()),
        status: "active"
      };
      
      const docRef = await addDoc(usersRef, userData);
      
      // Add to local state
      const newUserData: User = {
        id: docRef.id,
        uid: userCredential.user.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role as "admin" | "warden" | "student",
        hostelRoom: newUser.hostelRoom,
        createdAt: new Date().toLocaleString(),
        status: "active"
      };
      
      setUsers(prev => [newUserData, ...prev]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        [newUser.role + "s"]: prev[newUser.role + "s" as keyof typeof prev] + 1,
        active: prev.active + 1
      }));
      
      // Log activity
      await addDoc(collection(db, "activity_logs"), {
        userId: userData?.uid,
        activityType: "user-created",
        title: "User Created",
        description: `New ${newUser.role} account created: ${newUser.displayName}`,
        metadata: { userId: userCredential.user.uid },
        createdAt: Timestamp.fromDate(new Date())
      });
      
      toast({
        title: "User Created",
        description: `New ${newUser.role} account created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setNewUser({
        email: "",
        password: "",
        displayName: "",
        role: "student",
        hostelRoom: ""
      });
      
      onClose();
      
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error Creating User",
        description: error.message || "Failed to create user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser || !validateForm()) return;
    
    try {
      setLoading(true);
      
      // Update user in Firestore
      const userRef = doc(db, "users", selectedUser.id);
      
      const updateData = {
        displayName: newUser.displayName,
        role: newUser.role,
        hostelRoom: newUser.role === "student" ? newUser.hostelRoom : ""
      };
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                displayName: newUser.displayName,
                role: newUser.role as "admin" | "warden" | "student",
                hostelRoom: newUser.role === "student" ? newUser.hostelRoom : "",
              }
            : user
        )
      );
      
      // Update stats if role changed
      if (selectedUser.role !== newUser.role) {
        setStats(prev => ({
          ...prev,
          [selectedUser.role + "s"]: prev[selectedUser.role + "s" as keyof typeof prev] - 1,
          [newUser.role + "s"]: prev[newUser.role + "s" as keyof typeof prev] + 1
        }));
      }
      
      // Log activity
      await addDoc(collection(db, "activity_logs"), {
        userId: userData?.uid,
        activityType: "user-updated",
        title: "User Updated",
        description: `User account updated: ${newUser.displayName}`,
        metadata: { userId: selectedUser.uid },
        createdAt: Timestamp.fromDate(new Date())
      });
      
      toast({
        title: "User Updated",
        description: "User account updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error Updating User",
        description: error.message || "Failed to update user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setSelectedUser(null);
    }
  };
  
  // Toggle user status (active/inactive)
  const handleToggleUserStatus = async (user: User) => {
    try {
      setLoading(true);
      
      const newStatus = user.status === "active" ? "inactive" : "active";
      
      // Update user in Firestore
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        status: newStatus
      });
      
      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.id === user.id 
            ? { ...u, status: newStatus as "active" | "inactive" }
            : u
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        active: newStatus === "active" ? prev.active + 1 : prev.active - 1,
        inactive: newStatus === "inactive" ? prev.inactive + 1 : prev.inactive - 1
      }));
      
      // Log activity
      await addDoc(collection(db, "activity_logs"), {
        userId: userData?.uid,
        activityType: "user-status-changed",
        title: "User Status Changed",
        description: `User ${user.displayName} is now ${newStatus}`,
        metadata: { userId: user.uid, status: newStatus },
        createdAt: Timestamp.fromDate(new Date())
      });
      
      toast({
        title: "Status Updated",
        description: `User is now ${newStatus}`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      toast({
        title: "Error Updating Status",
        description: error.message || "Failed to update user status",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset user password
  const handleResetPassword = async (user: User) => {
    try {
      setLoading(true);
      
      await sendPasswordResetEmail(auth, user.email);
      
      // Log activity
      await addDoc(collection(db, "activity_logs"), {
        userId: userData?.uid,
        activityType: "password-reset",
        title: "Password Reset",
        description: `Password reset email sent to ${user.email}`,
        metadata: { userId: user.uid },
        createdAt: Timestamp.fromDate(new Date())
      });
      
      toast({
        title: "Password Reset Email Sent",
        description: `A password reset email has been sent to ${user.email}`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error Resetting Password",
        description: error.message || "Failed to send password reset email",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      
      // Delete user from Firestore
      const userRef = doc(db, "users", selectedUser.id);
      await deleteDoc(userRef);
      
      // Note: Deleting the user from Firebase Auth would require additional setup 
      // with Admin SDK or Cloud Functions for proper security implementation.
      // For this demo, we'll just delete from Firestore.
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        [selectedUser.role + "s"]: prev[selectedUser.role + "s" as keyof typeof prev] - 1,
        [selectedUser.status === "active" ? "active" : "inactive"]: 
          prev[selectedUser.status === "active" ? "active" : "inactive"] - 1
      }));
      
      // Log activity
      await addDoc(collection(db, "activity_logs"), {
        userId: userData?.uid,
        activityType: "user-deleted",
        title: "User Deleted",
        description: `User account deleted: ${selectedUser.displayName}`,
        metadata: { userId: selectedUser.uid },
        createdAt: Timestamp.fromDate(new Date())
      });
      
      toast({
        title: "User Deleted",
        description: "User account has been deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      setIsDeleteAlertOpen(false);
      setSelectedUser(null);
      
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error Deleting User",
        description: error.message || "Failed to delete user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Open edit user modal
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setNewUser({
      email: user.email,
      password: "", // We don't show or update password directly
      displayName: user.displayName,
      role: user.role,
      hostelRoom: user.hostelRoom || ""
    });
    setFormErrors({
      email: "",
      password: "",
      displayName: "",
      hostelRoom: ""
    });
    onOpen();
  };
  
  // Handle export users
  const handleExportUsers = () => {
    toast({
      title: "Exporting Users",
      description: "User data export started",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Helper function to get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "red";
      case "warden":
        return "purple";
      case "student":
        return "blue";
      default:
        return "gray";
    }
  };
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      
      <Box ml={{ base: 0, md: "64" }}>
        <TopBar title="User Management" />
        
        <Container maxW="7xl" py="6" px={{ base: "4", md: "6", lg: "8" }}>
          <Flex direction="column" mb="8">
            <Heading as="h1" size="lg" mb="4">
              User Management
            </Heading>
            <Text mb="6" color="gray.600">
              Manage user accounts, roles, and permissions
            </Text>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap="4" mb="6">
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Users</StatLabel>
                    <StatNumber>{stats.total}</StatNumber>
                    <StatHelpText>All accounts</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Students</StatLabel>
                    <StatNumber>{stats.students}</StatNumber>
                    <StatHelpText color="blue.500">
                      {stats.total > 0 ? Math.round((stats.students / stats.total) * 100) : 0}%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Wardens</StatLabel>
                    <StatNumber>{stats.wardens}</StatNumber>
                    <StatHelpText color="purple.500">
                      {stats.total > 0 ? Math.round((stats.wardens / stats.total) * 100) : 0}%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Admins</StatLabel>
                    <StatNumber>{stats.admins}</StatNumber>
                    <StatHelpText color="red.500">
                      {stats.total > 0 ? Math.round((stats.admins / stats.total) * 100) : 0}%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Active</StatLabel>
                    <StatNumber>{stats.active}</StatNumber>
                    <StatHelpText color="green.500">
                      {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Inactive</StatLabel>
                    <StatNumber>{stats.inactive}</StatNumber>
                    <StatHelpText color="orange.500">
                      {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </Grid>
            
            <Tabs colorScheme="blue" mb="6">
              <TabList>
                <Tab>Users</Tab>
                <Tab>Bulk Operations</Tab>
                <Tab>Access Control</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px="0">
                  <Flex justify="space-between" align="center" mb="4" direction={{ base: "column", md: "row" }} gap="4">
                    <Flex gap="4" w={{ base: "100%", md: "auto" }}>
                      <InputGroup maxW="300px">
                        <InputLeftElement pointerEvents="none">
                          <FiSearch color="gray.300" />
                        </InputLeftElement>
                        <Input 
                          placeholder="Search users..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </InputGroup>
                      
                      <Select 
                        placeholder="Filter by Role" 
                        maxW="150px"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="warden">Wardens</option>
                        <option value="admin">Admins</option>
                      </Select>
                      
                      <Select 
                        placeholder="Filter by Status" 
                        maxW="150px"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Select>
                    </Flex>
                    
                    <Flex gap="2">
                      <Button 
                        leftIcon={<FiPlus />} 
                        colorScheme="blue"
                        onClick={() => {
                          setSelectedUser(null);
                          setIsEditMode(false);
                          setNewUser({
                            email: "",
                            password: "",
                            displayName: "",
                            role: "student",
                            hostelRoom: ""
                          });
                          setFormErrors({
                            email: "",
                            password: "",
                            displayName: "",
                            hostelRoom: ""
                          });
                          onOpen();
                        }}
                      >
                        Add User
                      </Button>
                      
                      <Button 
                        leftIcon={<FiDownload />} 
                        colorScheme="blue" 
                        variant="outline"
                        onClick={handleExportUsers}
                      >
                        Export
                      </Button>
                    </Flex>
                  </Flex>
                  
                  {loading && !users.length ? (
                    <Center p="10">
                      <Spinner size="xl" color="blue.500" thickness="4px" />
                    </Center>
                  ) : filteredUsers.length === 0 ? (
                    <Center p="10" borderWidth="1px" borderRadius="lg">
                      <Box textAlign="center">
                        <Heading size="md" mb="3">No Users Found</Heading>
                        <Text color="gray.500" mb="4">
                          {searchQuery 
                            ? "No users match your search criteria" 
                            : roleFilter !== "all" 
                              ? `No ${roleFilter}s found`
                              : statusFilter !== "all"
                                ? `No ${statusFilter} users found`
                                : "No users have been added yet"}
                        </Text>
                        <Button 
                          leftIcon={<FiUserPlus />} 
                          colorScheme="blue"
                          onClick={() => {
                            setSelectedUser(null);
                            setIsEditMode(false);
                            setNewUser({
                              email: "",
                              password: "",
                              displayName: "",
                              role: "student",
                              hostelRoom: ""
                            });
                            onOpen();
                          }}
                        >
                          Add First User
                        </Button>
                      </Box>
                    </Center>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>User</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th>Room</Th>
                            <Th>Created</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredUsers.map((user) => (
                            <Tr key={user.id}>
                              <Td>
                                <Flex align="center">
                                  <Avatar size="sm" name={user.displayName} src={user.photoURL} mr="3" />
                                  <Text fontWeight="medium">{user.displayName}</Text>
                                </Flex>
                              </Td>
                              <Td>{user.email}</Td>
                              <Td>
                                <Badge colorScheme={getRoleBadgeColor(user.role)}>
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Badge>
                              </Td>
                              <Td>{user.hostelRoom || "-"}</Td>
                              <Td>{user.createdAt}</Td>
                              <Td>
                                <Flex align="center">
                                  <Switch 
                                    colorScheme="green" 
                                    isChecked={user.status === "active"}
                                    onChange={() => handleToggleUserStatus(user)}
                                    isDisabled={loading}
                                    mr="2"
                                  />
                                  <Text fontSize="sm" color={user.status === "active" ? "green.500" : "gray.500"}>
                                    {user.status === "active" ? "Active" : "Inactive"}
                                  </Text>
                                </Flex>
                              </Td>
                              <Td>
                                <Flex gap="2">
                                  <IconButton
                                    aria-label="Edit user"
                                    icon={<FiEdit />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => handleEditUser(user)}
                                  />
                                  <IconButton
                                    aria-label="Reset password"
                                    icon={<FiKey />}
                                    size="sm"
                                    colorScheme="orange"
                                    variant="ghost"
                                    onClick={() => handleResetPassword(user)}
                                  />
                                  <IconButton
                                    aria-label="Delete user"
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsDeleteAlertOpen(true);
                                    }}
                                  />
                                </Flex>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </TabPanel>
                
                <TabPanel>
                  <Box p="6" bg="white" borderRadius="md" shadow="sm">
                    <Heading size="md" mb="4">Bulk User Operations</Heading>
                    
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6">
                      <Box borderWidth="1px" borderRadius="md" p="4">
                        <Heading size="sm" mb="3">Bulk Import</Heading>
                        <Text fontSize="sm" color="gray.600" mb="4">
                          Import multiple users from a CSV file. The file should have the following columns:
                          email, name, role, hostelRoom.
                        </Text>
                        <Flex direction="column">
                          <FormControl mb="4">
                            <FormLabel>CSV File</FormLabel>
                            <Input type="file" accept=".csv" />
                          </FormControl>
                          <Button leftIcon={<FiUpload />} colorScheme="blue">
                            Upload and Import
                          </Button>
                        </Flex>
                      </Box>
                      
                      <Box borderWidth="1px" borderRadius="md" p="4">
                        <Heading size="sm" mb="3">Bulk Actions</Heading>
                        <Text fontSize="sm" color="gray.600" mb="4">
                          Perform actions on multiple users at once.
                        </Text>
                        <Flex direction="column" gap="3">
                          <Button leftIcon={<FiUserCheck />} colorScheme="green" variant="outline">
                            Activate Selected Users
                          </Button>
                          <Button leftIcon={<FiUserX />} colorScheme="orange" variant="outline">
                            Deactivate Selected Users
                          </Button>
                          <Button leftIcon={<FiKey />} colorScheme="blue" variant="outline">
                            Reset Passwords for Selected
                          </Button>
                        </Flex>
                      </Box>
                    </Grid>
                  </Box>
                </TabPanel>
                
                <TabPanel>
                  <Box p="6" bg="white" borderRadius="md" shadow="sm" textAlign="center">
                    <Text color="gray.600">Access control settings and permissions will be displayed here.</Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </Container>
      </Box>
      
      {/* Add/Edit User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? "Edit User" : "Add New User"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl isRequired isInvalid={!!formErrors.email} isDisabled={isEditMode}>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="user@example.com"
                />
                {formErrors.email && <FormErrorMessage>{formErrors.email}</FormErrorMessage>}
              </FormControl>
              
              {!isEditMode && (
                <FormControl isRequired isInvalid={!!formErrors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input 
                    type="password" 
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 characters"
                  />
                  {formErrors.password && <FormErrorMessage>{formErrors.password}</FormErrorMessage>}
                </FormControl>
              )}
              
              <FormControl isRequired isInvalid={!!formErrors.displayName}>
                <FormLabel>Full Name</FormLabel>
                <Input 
                  name="displayName"
                  value={newUser.displayName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
                {formErrors.displayName && <FormErrorMessage>{formErrors.displayName}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                >
                  <option value="student">Student</option>
                  <option value="warden">Warden</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormControl>
              
              {newUser.role === "student" && (
                <FormControl isRequired isInvalid={!!formErrors.hostelRoom}>
                  <FormLabel>Hostel Room</FormLabel>
                  <Input 
                    name="hostelRoom"
                    value={newUser.hostelRoom}
                    onChange={handleInputChange}
                    placeholder="e.g. A-101"
                  />
                  {formErrors.hostelRoom && <FormErrorMessage>{formErrors.hostelRoom}</FormErrorMessage>}
                </FormControl>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue"
              onClick={isEditMode ? handleUpdateUser : handleCreateUser}
              isLoading={loading}
            >
              {isEditMode ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete User Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {selectedUser?.displayName}? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDeleteUser} 
                ml={3}
                isLoading={loading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UserManagement;
