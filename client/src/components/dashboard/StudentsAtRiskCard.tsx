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
  Button, 
  HStack,
  IconButton
} from '@chakra-ui/react';
import { FiPhone, FiMail, FiList, FiBell } from 'react-icons/fi';

export interface StudentAtRisk {
  id: string;
  name: string;
  room: string;
  avatar?: string;
  missedMeals: {
    count: number;
    period: string;
  };
}

interface StudentsAtRiskCardProps {
  students: StudentAtRisk[];
  onViewAll: () => void;
  onSendBulkNotification: () => void;
  onCallStudent: (studentId: string) => void;
  onEmailStudent: (studentId: string) => void;
}

const StudentsAtRiskCard = ({ 
  students, 
  onViewAll, 
  onSendBulkNotification,
  onCallStudent,
  onEmailStudent
}: StudentsAtRiskCardProps) => {
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
          Students at Risk
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
                  Missed
                </Th>
                <Th px="4" py="3" fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {students.map((student) => (
                <Tr key={student.id}>
                  <Td px="4" py="3" whiteSpace="nowrap">
                    <Flex alignItems="center">
                      <Avatar size="sm" src={student.avatar} name={student.name} />
                      <Box ml="3">
                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                          {student.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Room {student.room}
                        </Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td px="4" py="3" whiteSpace="nowrap">
                    <Text fontSize="sm" color="gray.900">
                      {student.missedMeals.count} meals
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {student.missedMeals.period}
                    </Text>
                  </Td>
                  <Td px="4" py="3" whiteSpace="nowrap">
                    <HStack spacing="3">
                      <IconButton
                        aria-label="Call student"
                        icon={<FiPhone />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => onCallStudent(student.id)}
                      />
                      <IconButton
                        aria-label="Email student"
                        icon={<FiMail />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => onEmailStudent(student.id)}
                      />
                    </HStack>
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
            View All
          </Button>
          <Button
            size="xs"
            leftIcon={<FiBell />}
            bg="red.50"
            color="red.600"
            _hover={{ bg: "red.100" }}
            fontWeight="medium"
            onClick={onSendBulkNotification}
          >
            Send Bulk Notification
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default StudentsAtRiskCard;
