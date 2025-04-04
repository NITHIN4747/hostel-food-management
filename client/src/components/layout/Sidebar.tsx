import { useState, useEffect } from "react";
import { 
  Box, 
  Flex, 
  Text, 
  Icon, 
  Link as ChakraLink, 
  Image, 
  Button, 
  Divider,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  Avatar,
  VStack,
  HStack
} from "@chakra-ui/react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../hooks/useAuth";
import { 
  FiHome, 
  FiCalendar, 
  FiUsers, 
  FiSettings, 
  FiLogOut, 
  FiMenu,
  FiBarChart2,
  FiUtensils,
  FiPaperclip
} from "react-icons/fi";

// Navigation link component
interface NavLinkProps {
  to: string;
  icon: React.ReactElement;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const NavLink = ({ to, icon, children, isActive, onClick }: NavLinkProps) => {
  return (
    <Link href={to}>
      <ChakraLink
        display="flex"
        alignItems="center"
        px="3"
        py="2"
        rounded="md"
        fontSize="sm"
        fontWeight="medium"
        onClick={onClick}
        bg={isActive ? "blue.50" : "transparent"}
        color={isActive ? "blue.600" : "gray.700"}
        _hover={{ bg: isActive ? "blue.50" : "gray.100" }}
        textDecoration="none"
      >
        <Box color={isActive ? "blue.500" : "gray.500"} mr="3">
          {icon}
        </Box>
        {children}
      </ChakraLink>
    </Link>
  );
};

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userData, logout, isAdmin, isWarden } = useAuth();
  const [location] = useLocation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Close drawer when navigating on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [location, isMobile, isOpen, onClose]);

  const handleLogout = async () => {
    await logout();
  };

  const logoSection = (
    <Flex px="6" py="4" alignItems="center" borderBottomWidth="1px" justifyContent={isMobile ? "space-between" : "center"}>
      <Flex alignItems="center">
        <Box bg="blue.500" color="white" p="2" rounded="md">
          <Icon as={FiHome} />
        </Box>
        <Text ml="3" fontWeight="bold" fontSize="lg" color="gray.800">
          HostelTrack
        </Text>
      </Flex>
      {isMobile && (
        <Button variant="ghost" onClick={onClose}>
          <Icon as={FiMenu} />
        </Button>
      )}
    </Flex>
  );

  const navigationLinks = (
    <VStack spacing="1" align="stretch" p="4">
      <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb="2">
        Main
      </Text>
      
      <NavLink to="/dashboard" icon={<Icon as={FiHome} />} isActive={location === "/dashboard"} onClick={onClose}>
        Dashboard
      </NavLink>
      
      <NavLink to="/attendance" icon={<Icon as={FiCalendar} />} isActive={location === "/attendance"} onClick={onClose}>
        Attendance
      </NavLink>
      
      <NavLink to="/meals" icon={<Icon as={FiUtensils} />} isActive={location === "/meals"} onClick={onClose}>
        Meal Tracking
      </NavLink>
      
      <NavLink to="/reports" icon={<Icon as={FiBarChart2} />} isActive={location === "/reports"} onClick={onClose}>
        Reports
      </NavLink>
      
      <NavLink to="/leave" icon={<Icon as={FiPaperclip} />} isActive={location === "/leave"} onClick={onClose}>
        Leave Management
      </NavLink>
      
      {(isAdmin || isWarden) && (
        <>
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mt="8" mb="2">
            Admin
          </Text>
          
          <NavLink to="/users" icon={<Icon as={FiUsers} />} isActive={location === "/users"} onClick={onClose}>
            User Management
          </NavLink>
          
          <NavLink to="/settings" icon={<Icon as={FiSettings} />} isActive={location === "/settings"} onClick={onClose}>
            Settings
          </NavLink>
        </>
      )}
    </VStack>
  );

  const userProfile = (
    <Flex borderTopWidth="1px" p="4" display={isMobile ? "none" : "flex"}>
      <Flex align="center" width="100%">
        <Avatar size="sm" src={userData?.photoURL || undefined} name={userData?.displayName} />
        <Box ml="3" overflow="hidden">
          <Text fontSize="sm" fontWeight="medium" color="gray.700" noOfLines={1}>
            {userData?.displayName}
          </Text>
          <Text fontSize="xs" fontWeight="medium" color="gray.500" noOfLines={1}>
            {userData?.role.charAt(0).toUpperCase() + userData?.role.slice(1)}
          </Text>
        </Box>
        <Button ml="auto" variant="ghost" onClick={handleLogout} aria-label="Sign out">
          <Icon as={FiLogOut} />
        </Button>
      </Flex>
    </Flex>
  );

  // Mobile drawer component
  const mobileDrawer = (
    <>
      <Button
        display={{ base: "flex", md: "none" }}
        position="fixed"
        top="4"
        left="4"
        zIndex="20"
        onClick={onOpen}
        aria-label="Open menu"
        variant="outline"
      >
        <Icon as={FiMenu} />
      </Button>
      
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          {logoSection}
          <DrawerBody p="0">
            {navigationLinks}
            <Divider my="4" />
            <Box p="4">
              <HStack>
                <Avatar size="sm" src={userData?.photoURL || undefined} name={userData?.displayName} />
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium">{userData?.displayName}</Text>
                  <Text fontSize="xs" color="gray.500">{userData?.role}</Text>
                </Box>
              </HStack>
              <Button 
                mt="4" 
                leftIcon={<Icon as={FiLogOut} />} 
                colorScheme="red" 
                variant="outline" 
                size="sm" 
                width="full" 
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );

  // Desktop sidebar component
  const desktopSidebar = (
    <Box
      as="aside"
      bg="white"
      borderRightWidth="1px"
      w="64"
      position="fixed"
      inset="0"
      display={{ base: "none", md: "flex" }}
      flexDir="column"
      zIndex="10"
    >
      {logoSection}
      <Box flex="1" overflowY="auto">
        {navigationLinks}
      </Box>
      {userProfile}
    </Box>
  );

  return (
    <>
      {mobileDrawer}
      {desktopSidebar}
    </>
  );
};

export default Sidebar;
