import { 
  Box, 
  Flex, 
  Heading, 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Button, 
  useColorModeValue,
  Avatar,
  Text,
  Badge,
  HStack,
  useBreakpointValue
} from "@chakra-ui/react";
import { FiBell, FiChevronDown, FiLogOut } from "react-icons/fi";
import { useLocation } from "wouter";
import { useAuth } from "../../hooks/useAuth";

interface TopBarProps {
  title: string;
}

const TopBar = ({ title }: TopBarProps) => {
  const { userData, logout } = useAuth();
  const [location] = useLocation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const handleLogout = async () => {
    await logout();
  };
  
  const getPageTitle = () => {
    switch (location) {
      case "/dashboard":
        return "Dashboard";
      case "/attendance":
        return "Attendance Tracking";
      case "/meals":
        return "Meal Tracking";
      case "/reports":
        return "Reports";
      case "/leave":
        return "Leave Management";
      case "/users":
        return "User Management";
      case "/settings":
        return "Settings";
      default:
        return title;
    }
  };
  
  return (
    <Box
      as="header"
      bg={bg}
      borderBottomWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      position="sticky"
      top="0"
      zIndex="5"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mx="auto"
        px={{ base: 4, md: 6, lg: 8 }}
        h="16"
      >
        <Flex alignItems="center">
          <Heading as="h2" size="md" fontWeight="semibold" color="gray.800">
            {getPageTitle()}
          </Heading>
        </Flex>
        
        <HStack spacing="4">
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              icon={<FiBell />}
              variant="ghost"
              color="gray.500"
              _hover={{ color: "gray.700" }}
            />
            <Badge
              position="absolute"
              top="0"
              right="0"
              transform="translate(30%, -30%)"
              colorScheme="purple"
              borderRadius="full"
              p="1"
              boxSize="2"
            />
          </Box>
          
          {isMobile ? (
            <Avatar size="sm" src={userData?.photoURL || undefined} name={userData?.displayName} />
          ) : (
            <Menu>
              <MenuButton as={Button} variant="ghost" rightIcon={<FiChevronDown />} px="2">
                <HStack spacing="2">
                  <Avatar size="sm" src={userData?.photoURL || undefined} name={userData?.displayName} />
                  <Box textAlign="left" display={{ base: "none", md: "block" }}>
                    <Text fontSize="sm" fontWeight="medium">{userData?.displayName}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {userData?.role.charAt(0).toUpperCase() + userData?.role.slice(1)}
                    </Text>
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default TopBar;
