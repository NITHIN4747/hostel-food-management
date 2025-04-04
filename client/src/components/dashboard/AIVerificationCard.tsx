import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Icon, 
  Button, 
  VStack, 
  Divider,
  Link,
  Progress
} from '@chakra-ui/react';
import { FiRobot, FiChevronRight } from 'react-icons/fi';

interface VerificationStat {
  label: string;
  value: number;
  color: string;
}

interface AIVerificationCardProps {
  stats: VerificationStat[];
  onStartVerification: () => void;
}

const AIVerificationCard = ({ stats, onStartVerification }: AIVerificationCardProps) => {
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
          AI Verification
        </Heading>
      </Flex>
      
      <Box p="5">
        <Flex 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          p="6" 
          bg="blue.50" 
          rounded="lg"
        >
          <Flex 
            alignItems="center" 
            justifyContent="center" 
            h="16" 
            w="16" 
            rounded="full" 
            bg="blue.100" 
            color="blue.600" 
            mb="4"
          >
            <Icon as={FiRobot} boxSize="6" />
          </Flex>
          <Heading as="h3" fontSize="lg" fontWeight="medium" color="gray.900" mb="2">
            Face Recognition
          </Heading>
          <Text fontSize="sm" color="gray.600" textAlign="center" mb="6">
            Verify student identity with our AI-powered facial recognition.
          </Text>
          <Button 
            w="full" 
            colorScheme="blue" 
            onClick={onStartVerification}
          >
            Start Verification
          </Button>
        </Flex>
        
        <Box mt="6">
          <Text fontSize="sm" fontWeight="medium" color="gray.900" mb="2">
            Today's Verification Stats
          </Text>
          <VStack spacing="3" align="stretch">
            {stats.map((stat, index) => (
              <Box key={index}>
                <Flex justify="space-between" mb="1">
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    {stat.label}
                  </Text>
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    {stat.value}%
                  </Text>
                </Flex>
                <Progress 
                  value={stat.value} 
                  size="xs" 
                  colorScheme={stat.color} 
                  borderRadius="full"
                />
              </Box>
            ))}
          </VStack>
        </Box>
        
        <Divider my="6" borderColor="gray.200" />
        
        <Link
          href="#"
          display="flex"
          alignItems="center"
          fontSize="sm"
          fontWeight="medium"
          color="blue.600"
          _hover={{ color: "blue.700" }}
        >
          <Text>View detailed verification report</Text>
          <Icon as={FiChevronRight} ml="2" boxSize="3" />
        </Link>
      </Box>
    </Box>
  );
};

export default AIVerificationCard;
