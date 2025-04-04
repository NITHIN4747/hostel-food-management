import { 
  Box, 
  Flex, 
  Heading, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Avatar, 
  Text, 
  Badge, 
  Button, 
  HStack
} from '@chakra-ui/react';
import { FiList, FiCheck } from 'react-icons/fi';

export interface LeaveRequest {
  id: string;
  student: {
    id: string;
    name: string;
    room: string;
    avatar?: string;
  };
  dates: {
    start: string;
    end: string;
    duration: string;
  };
  status: 'pending' | 'approved' | 'rejected';
}

interface UpcomingLeavesCardProps {
  leaves: LeaveRequest[];
  onViewAll: () => void;
  onApproveSelected: () => void;
}

const UpcomingLeavesCard = ({ leaves, onViewAll, onApproveSelected }: UpcomingLeavesCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box 
      bg="white" 
      rounded="lg" 
      shadow="sm" 
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Flex px="5" py="4" borderBottomWidth="1px">
        <Heading as="h2" fontSize="lg" fontWeight="medium" color="gray.900">
          Upcoming Leaves
        </Heading>
      </Flex>
      
      <Box p="5">
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th px="4" py="3" fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
                  Student
                </Th>
                <Th px="4" py="3" fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
                  Dates
                </Th>
                <Th px="4" py="3" fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
                  Status
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {leaves.map((leave) => (
                <Tr key={leave.id}>
                  <Td px="4" py="3" whiteSpace="nowrap">
                    <Flex alignItems="center">
                      <Avatar size="sm" src={leave.student.avatar} name={leave.student.name} />
                      <Box ml="3">
                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                          {leave.student.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Room {leave.student.room}
                        </Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td px="4" py="3" whiteSpace="nowrap">
                    <Text fontSize="sm" color="gray.900">
                      {leave.dates.start} - {leave.dates.end}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {leave.dates.duration}
                    </Text>
                  </Td>
                  <Td px="4" py="3" whiteSpace="nowrap">
                    <Badge 
                      px="2" 
                      fontSize="xs" 
                      fontWeight="semibold" 
                      rounded="full" 
                      colorScheme={getStatusColor(leave.status)}
                    >
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        
        <HStack mt="4" justify="space-between">
          <Button
            size="xs"
            leftIcon={<FiList />}
            bg="gray.100"
            color="gray.800"
            _hover={{ bg: "gray.200" }}
            fontWeight="medium"
            onClick={onViewAll}
          >
            View All Leaves
          </Button>
          <Button
            size="xs"
            leftIcon={<FiCheck />}
            bg="blue.50"
            color="blue.600"
            _hover={{ bg: "blue.100" }}
            fontWeight="medium"
            onClick={onApproveSelected}
          >
            Approve Selected
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default UpcomingLeavesCard;
