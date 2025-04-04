import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Icon, 
  VStack
} from '@chakra-ui/react';
import { IconType } from 'react-icons';

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: IconType;
  iconBg: string;
  iconColor: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
}

const RecentActivityCard = ({ activities }: RecentActivityCardProps) => {
  return (
    <Box 
      bg="white" 
      rounded="lg" 
      shadow="sm" 
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.200"
      h="100%"
    >
      <Flex px="5" py="4" borderBottomWidth="1px">
        <Heading as="h2" fontSize="lg" fontWeight="medium" color="gray.900">
          Recent Activity
        </Heading>
      </Flex>
      
      <Box p="5" overflowY="auto" h="96">
        <VStack spacing="0" align="stretch">
          {activities.map((activity) => (
            <Box 
              key={activity.id}
              mb="4" 
              pb="4" 
              borderBottomWidth="1px" 
              borderColor="gray.200"
              _last={{ borderBottom: "none", mb: 0, pb: 0 }}
            >
              <Flex>
                <Box flexShrink={0}>
                  <Flex 
                    alignItems="center" 
                    justifyContent="center" 
                    h="8" 
                    w="8" 
                    rounded="md" 
                    bg={activity.iconBg} 
                    color={activity.iconColor}
                  >
                    <Icon as={activity.icon} />
                  </Flex>
                </Box>
                <Box ml="4">
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {activity.title}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {activity.description}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {activity.timestamp}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default RecentActivityCard;
