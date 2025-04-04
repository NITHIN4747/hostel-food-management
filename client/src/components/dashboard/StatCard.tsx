import { Box, Flex, Text, Icon, Link } from "@chakra-ui/react";
import { IconType } from "react-icons";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconType;
  iconBg: string;
  iconColor: string;
  linkText: string;
  linkHref: string;
}

const StatCard = ({ title, value, icon, iconBg, iconColor, linkText, linkHref }: StatCardProps) => {
  return (
    <Box 
      bg="white" 
      rounded="lg" 
      shadow="sm" 
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Box p="5">
        <Flex alignItems="center">
          <Flex 
            alignItems="center" 
            justifyContent="center" 
            bg={iconBg} 
            rounded="md" 
            p="3" 
            flexShrink={0}
          >
            <Icon as={icon} boxSize="5" color={iconColor} />
          </Flex>
          <Box ml="5" w="0" flex="1">
            <Text fontSize="sm" fontWeight="medium" color="gray.500" isTruncated>
              {title}
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {value}
            </Text>
          </Box>
        </Flex>
      </Box>
      <Box bg="gray.50" px="5" py="3">
        <Text fontSize="sm">
          <Link 
            href={linkHref}
            fontWeight="medium" 
            color="blue.600" 
            _hover={{ color: "blue.700" }}
          >
            {linkText}
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default StatCard;
