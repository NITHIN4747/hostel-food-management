import { useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Heading, 
  Button, 
  Progress, 
  HStack, 
  VStack,
  Circle
} from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';
import Chart from 'chart.js/auto';

interface MealData {
  label: string;
  count: number;
  total: number;
  percentage: number;
  color: string;
}

interface MealTrackingCardProps {
  date: string;
  meals: MealData[];
  trendData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
}

const MealTrackingCard = ({ date, meals, trendData }: MealTrackingCardProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: trendData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  font: {
                    size: 11
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              y: {
                min: 300,
                max: 450,
                ticks: {
                  font: {
                    size: 10
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                ticks: {
                  font: {
                    size: 10
                  }
                },
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trendData]);

  return (
    <Box 
      bg="white" 
      rounded="lg" 
      shadow="sm" 
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Flex px="5" py="4" borderBottomWidth="1px" justifyContent="space-between" alignItems="center">
        <Heading as="h2" fontSize="lg" fontWeight="medium" color="gray.900">
          Today's Meal Tracking
        </Heading>
        <Text fontSize="sm" color="gray.500">
          {date}
        </Text>
      </Flex>
      
      <Box p="5">
        <VStack spacing="4" align="stretch">
          {meals.map((meal, index) => (
            <Flex key={index} alignItems="center" justifyContent="space-between">
              <HStack>
                <Circle size="2" bg={meal.color} />
                <Text fontSize="sm" fontWeight="medium">{meal.label}</Text>
              </HStack>
              <HStack spacing="4">
                <Text fontSize="sm" color="gray.600">{meal.count} students</Text>
                <Box w="24">
                  <Progress 
                    value={meal.percentage} 
                    size="xs" 
                    colorScheme={
                      meal.label === 'Breakfast' 
                        ? 'yellow' 
                        : meal.label === 'Lunch' 
                          ? 'blue' 
                          : 'teal'
                    }
                    borderRadius="full"
                  />
                </Box>
                <Text fontSize="sm" fontWeight="medium">{meal.percentage}%</Text>
              </HStack>
            </Flex>
          ))}
        </VStack>
        
        <Box mt="6" h="200px">
          <canvas ref={chartRef} />
        </Box>
        
        <Flex mt="4" justifyContent="flex-end">
          <Button
            size="xs"
            leftIcon={<FiDownload />}
            bg="blue.50"
            color="blue.600"
            _hover={{ bg: "blue.100" }}
            fontWeight="medium"
          >
            Export Report
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default MealTrackingCard;
