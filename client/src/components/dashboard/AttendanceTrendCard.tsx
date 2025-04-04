import { useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Select
} from '@chakra-ui/react';
import Chart from 'chart.js/auto';

interface AttendanceTrendCardProps {
  timeRanges: string[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderRadius?: number;
    }[];
  };
}

const AttendanceTrendCard = ({ 
  timeRanges, 
  selectedRange, 
  onRangeChange,
  chartData 
}: AttendanceTrendCardProps) => {
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
          type: 'bar',
          data: chartData,
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
                stacked: false,
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
                stacked: false,
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
  }, [chartData]);

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
      <Flex px="5" py="4" borderBottomWidth="1px" justifyContent="space-between" alignItems="center">
        <Heading as="h2" fontSize="lg" fontWeight="medium" color="gray.900">
          Attendance Trend
        </Heading>
        <Select 
          size="sm" 
          borderColor="gray.300" 
          rounded="md" 
          shadow="sm" 
          focusBorderColor="blue.300"
          width="auto"
          value={selectedRange}
          onChange={(e) => onRangeChange(e.target.value)}
        >
          {timeRanges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </Select>
      </Flex>
      
      <Box p="5" h="280px">
        <canvas ref={chartRef} />
      </Box>
    </Box>
  );
};

export default AttendanceTrendCard;
