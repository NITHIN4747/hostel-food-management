import { useState, useEffect, useRef } from "react";
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
  Select,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  VStack,
  Progress,
  Spinner,
  Center
} from "@chakra-ui/react";
import { 
  FiDownload, 
  FiCalendar, 
  FiDollarSign, 
  FiBarChart2, 
  FiPieChart, 
  FiTrendingUp, 
  FiTrendingDown,
  FiSearch 
} from "react-icons/fi";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import Chart from "chart.js/auto";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

const Reports = () => {
  const toast = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>("meal-consumption");
  const [timeRange, setTimeRange] = useState<string>("week");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  
  // References for charts
  const attendanceChartRef = useRef<HTMLCanvasElement | null>(null);
  const mealComparisonChartRef = useRef<HTMLCanvasElement | null>(null);
  const costSavingsChartRef = useRef<HTMLCanvasElement | null>(null);
  const adjustmentChartRef = useRef<HTMLCanvasElement | null>(null);
  
  // Stats and summary data
  const [stats, setStats] = useState({
    totalMeals: 0,
    attendedMeals: 0,
    missedMeals: 0,
    attendanceRate: 0,
    savingsAmount: 0,
    wasteReduction: 0
  });
  
  // Financial adjustments data
  const [adjustments, setAdjustments] = useState([]);
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would fetch data from Firestore
        // based on selected report type and time range
        
        // For the demo, we'll just simulate a delay and set mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock statistics based on report type
        if (reportType === "meal-consumption") {
          setStats({
            totalMeals: 8235,
            attendedMeals: 6870,
            missedMeals: 1365,
            attendanceRate: 83.4,
            savingsAmount: 27480,
            wasteReduction: 28.5
          });
        } else if (reportType === "financial-adjustments") {
          setStats({
            totalMeals: 8235,
            attendedMeals: 6870,
            missedMeals: 1365,
            attendanceRate: 83.4,
            savingsAmount: 35640,
            wasteReduction: 32.1
          });
        } else {
          setStats({
            totalMeals: 8235,
            attendedMeals: 6870,
            missedMeals: 1365,
            attendanceRate: 83.4,
            savingsAmount: 12950,
            wasteReduction: 24.7
          });
        }
        
        // Initialize charts
        initCharts();
        
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch report data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [reportType, timeRange, year, month, toast]);
  
  // Initialize charts
  const initCharts = () => {
    // Attendance trend chart
    if (attendanceChartRef.current) {
      const ctx = attendanceChartRef.current.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                label: 'Breakfast',
                data: [75, 82, 78, 85, 80, 70, 68],
                borderColor: '#ECC94B',
                backgroundColor: 'rgba(236, 201, 75, 0.1)',
                tension: 0.4
              },
              {
                label: 'Lunch',
                data: [88, 90, 92, 88, 85, 82, 78],
                borderColor: '#4299E1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                tension: 0.4
              },
              {
                label: 'Dinner',
                data: [85, 87, 83, 86, 82, 75, 70],
                borderColor: '#38B2AC',
                backgroundColor: 'rgba(56, 178, 172, 0.1)',
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              },
              title: {
                display: true,
                text: 'Meal Attendance Trends (% of Total)'
              }
            },
            scales: {
              y: {
                min: 60,
                max: 100,
                title: {
                  display: true,
                  text: 'Attendance Percentage'
                }
              }
            }
          }
        });
      }
    }
    
    // Meal comparison chart
    if (mealComparisonChartRef.current) {
      const ctx = mealComparisonChartRef.current.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Breakfast', 'Lunch', 'Dinner'],
            datasets: [
              {
                label: 'Attended',
                data: [2100, 2450, 2320],
                backgroundColor: 'rgba(56, 178, 172, 0.7)'
              },
              {
                label: 'Missed',
                data: [520, 350, 495],
                backgroundColor: 'rgba(245, 101, 101, 0.7)'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              },
              title: {
                display: true,
                text: 'Meal Attendance Comparison'
              }
            },
            scales: {
              x: {
                stacked: false
              },
              y: {
                stacked: false,
                title: {
                  display: true,
                  text: 'Number of Meals'
                }
              }
            }
          }
        });
      }
    }
    
    // Cost savings chart
    if (costSavingsChartRef.current) {
      const ctx = costSavingsChartRef.current.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              {
                label: 'Cost Savings (₹)',
                data: [5800, 7200, 6900, 7580],
                borderColor: '#48BB78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                tension: 0.4
              },
              {
                label: 'Potential Savings (₹)',
                data: [8500, 8700, 8900, 9200],
                borderColor: '#A0AEC0',
                backgroundColor: 'rgba(160, 174, 192, 0.1)',
                borderDash: [5, 5],
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              },
              title: {
                display: true,
                text: 'Weekly Cost Savings'
              }
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'Amount (₹)'
                }
              }
            }
          }
        });
      }
    }
    
    // Financial adjustments chart
    if (adjustmentChartRef.current) {
      const ctx = adjustmentChartRef.current.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['No Adjustment (95%+ attendance)', 'Small Adjustment (85-95% attendance)', 'Medium Adjustment (70-85% attendance)', 'Large Adjustment (<70% attendance)'],
            datasets: [
              {
                data: [42, 28, 18, 12],
                backgroundColor: [
                  'rgba(72, 187, 120, 0.7)',
                  'rgba(66, 153, 225, 0.7)',
                  'rgba(236, 201, 75, 0.7)',
                  'rgba(245, 101, 101, 0.7)'
                ]
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              },
              title: {
                display: true,
                text: 'Financial Adjustments Distribution'
              }
            }
          }
        });
      }
    }
  };
  
  // Handle export report
  const handleExportReport = () => {
    toast({
      title: "Exporting Report",
      description: `Exporting ${reportType.replace('-', ' ')} report for the selected time period`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      
      <Box ml={{ base: 0, md: "64" }}>
        <TopBar title="Reports" />
        
        <Container maxW="7xl" py="6" px={{ base: "4", md: "6", lg: "8" }}>
          <Flex direction="column" mb="8">
            <Heading as="h1" size="lg" mb="4">
              Reports & Analytics
            </Heading>
            <Text mb="6" color="gray.600">
              Generate detailed reports on meal consumption and financial adjustments
            </Text>
            
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap="4" mb="6">
              <FormControl>
                <FormLabel>Report Type</FormLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="meal-consumption">Meal Consumption Report</option>
                  <option value="financial-adjustments">Financial Adjustments Report</option>
                  <option value="food-waste">Food Waste Reduction Report</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Time Range</FormLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Current Month</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Year to Date</option>
                  <option value="custom">Custom Range</option>
                </Select>
              </FormControl>
              
              {timeRange === "custom" && (
                <FormControl>
                  <FormLabel>Period</FormLabel>
                  <HStack>
                    <Select 
                      value={month} 
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option value="01">January</option>
                      <option value="02">February</option>
                      <option value="03">March</option>
                      <option value="04">April</option>
                      <option value="05">May</option>
                      <option value="06">June</option>
                      <option value="07">July</option>
                      <option value="08">August</option>
                      <option value="09">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </Select>
                    <Select 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </Select>
                  </HStack>
                </FormControl>
              )}
            </Grid>
            
            <Flex justify="flex-end" mb="6">
              <Button
                leftIcon={<FiDownload />}
                colorScheme="blue"
                onClick={handleExportReport}
                isLoading={loading}
              >
                Export Report
              </Button>
            </Flex>
            
            {loading ? (
              <Center p="10">
                <VStack>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text mt="4" color="gray.600">Loading report data...</Text>
                </VStack>
              </Center>
            ) : (
              <Tabs colorScheme="blue" mb="6">
                <TabList>
                  <Tab>Summary</Tab>
                  <Tab>Charts</Tab>
                  <Tab>Details</Tab>
                  {reportType === "financial-adjustments" && <Tab>Adjustments</Tab>}
                </TabList>
                
                <TabPanels>
                  <TabPanel px="0">
                    <Grid 
                      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
                      gap="6" 
                      mb="6"
                    >
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Total Meals</StatLabel>
                            <StatNumber>{stats.totalMeals.toLocaleString()}</StatNumber>
                            <StatHelpText>Scheduled for the period</StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Meals Consumed</StatLabel>
                            <StatNumber>{stats.attendedMeals.toLocaleString()}</StatNumber>
                            <StatHelpText color="green.500">
                              {stats.attendanceRate}% attendance rate
                            </StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Meals Missed</StatLabel>
                            <StatNumber>{stats.missedMeals.toLocaleString()}</StatNumber>
                            <StatHelpText color="red.500">
                              {(100 - stats.attendanceRate).toFixed(1)}% missed rate
                            </StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Cost Savings</StatLabel>
                            <StatNumber>₹{stats.savingsAmount.toLocaleString()}</StatNumber>
                            <StatHelpText color="green.500">
                              From accurate meal planning
                            </StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Waste Reduction</StatLabel>
                            <StatNumber>{stats.wasteReduction}%</StatNumber>
                            <StatHelpText color="green.500">
                              Compared to baseline
                            </StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody>
                          <Stat>
                            <StatLabel>Average Per Student</StatLabel>
                            <HStack>
                              <StatNumber>₹{Math.round(stats.savingsAmount / 487).toLocaleString()}</StatNumber>
                              <Badge colorScheme="green">Saved</Badge>
                            </HStack>
                            <StatHelpText>
                              Potential for adjustment
                            </StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                    </Grid>
                    
                    <Card mb="6">
                      <CardHeader>
                        <Heading size="md">
                          {reportType === "meal-consumption" 
                            ? "Meal Consumption Summary" 
                            : reportType === "financial-adjustments"
                              ? "Financial Adjustments Summary"
                              : "Food Waste Reduction Summary"}
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <Text mb="4">
                          {reportType === "meal-consumption" 
                            ? `During this period, ${stats.attendanceRate}% of scheduled meals were consumed, with breakfast having the lowest attendance at ${stats.attendanceRate - 8}%. Lunch had the highest attendance at ${stats.attendanceRate + 5}%. Weekend meals show consistently lower attendance compared to weekdays.`
                            : reportType === "financial-adjustments"
                              ? `Based on meal attendance data, financial adjustments totaling ₹${stats.savingsAmount} can be made for this period. 58% of students qualify for some form of refund based on their attendance patterns.`
                              : `Food waste has been reduced by ${stats.wasteReduction}% through better meal planning based on attendance tracking. This translates to approximately ${Math.round(stats.missedMeals * 0.45)} kg of food saved from being wasted.`}
                        </Text>
                        
                        <HStack spacing="10" wrap="wrap">
                          <VStack align="flex-start" minW="200px" mb="4">
                            <Text fontWeight="medium">Attendance by Meal Type</Text>
                            <HStack w="full">
                              <Text fontSize="sm" minW="80px">Breakfast:</Text>
                              <Progress value={stats.attendanceRate - 8} size="sm" colorScheme="yellow" flex="1" />
                              <Text fontSize="sm">{stats.attendanceRate - 8}%</Text>
                            </HStack>
                            <HStack w="full">
                              <Text fontSize="sm" minW="80px">Lunch:</Text>
                              <Progress value={stats.attendanceRate + 5} size="sm" colorScheme="blue" flex="1" />
                              <Text fontSize="sm">{stats.attendanceRate + 5}%</Text>
                            </HStack>
                            <HStack w="full">
                              <Text fontSize="sm" minW="80px">Dinner:</Text>
                              <Progress value={stats.attendanceRate} size="sm" colorScheme="teal" flex="1" />
                              <Text fontSize="sm">{stats.attendanceRate}%</Text>
                            </HStack>
                          </VStack>
                          
                          <VStack align="flex-start" minW="200px" mb="4">
                            <Text fontWeight="medium">Attendance by Day</Text>
                            <HStack w="full">
                              <Text fontSize="sm" minW="80px">Weekday:</Text>
                              <Progress value={stats.attendanceRate + 3} size="sm" colorScheme="green" flex="1" />
                              <Text fontSize="sm">{stats.attendanceRate + 3}%</Text>
                            </HStack>
                            <HStack w="full">
                              <Text fontSize="sm" minW="80px">Weekend:</Text>
                              <Progress value={stats.attendanceRate - 12} size="sm" colorScheme="orange" flex="1" />
                              <Text fontSize="sm">{stats.attendanceRate - 12}%</Text>
                            </HStack>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <Heading size="md">Recommendations</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="flex-start" spacing="4">
                          <Box>
                            <Heading size="sm" mb="2">Meal Planning</Heading>
                            <Text>
                              {reportType === "meal-consumption" 
                                ? "Reduce breakfast preparation by 10% on weekends to match lower attendance patterns."
                                : reportType === "financial-adjustments"
                                  ? "Use a tiered adjustment system based on actual meal consumption rates."
                                  : "Focus on reducing breakfast portion sizes by 10% on weekends to reduce waste."}
                            </Text>
                          </Box>
                          
                          <Box>
                            <Heading size="sm" mb="2">Attendance Monitoring</Heading>
                            <Text>
                              Implement automated reminders for students who consistently miss meals to update their leave plans.
                            </Text>
                          </Box>
                          
                          <Box>
                            <Heading size="sm" mb="2">Financial Impact</Heading>
                            <Text>
                              {reportType === "meal-consumption" 
                                ? "Current attendance patterns indicate a potential for 15% cost reduction through optimized food purchasing."
                                : reportType === "financial-adjustments"
                                  ? "Process mid-semester adjustments for students with attendance below 75% to improve financial transparency."
                                  : "The current waste reduction translates to approximately ₹125 saved per student per month."}
                            </Text>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabPanel>
                  
                  <TabPanel px="0">
                    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="6" mb="6">
                      <Card>
                        <CardHeader>
                          <Heading size="md">Meal Attendance Trends</Heading>
                        </CardHeader>
                        <CardBody>
                          <Box h="300px">
                            <canvas ref={attendanceChartRef} />
                          </Box>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <Heading size="md">Meal Comparison</Heading>
                        </CardHeader>
                        <CardBody>
                          <Box h="300px">
                            <canvas ref={mealComparisonChartRef} />
                          </Box>
                        </CardBody>
                      </Card>
                    </Grid>
                    
                    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="6">
                      <Card>
                        <CardHeader>
                          <Heading size="md">Cost Savings Trend</Heading>
                        </CardHeader>
                        <CardBody>
                          <Box h="300px">
                            <canvas ref={costSavingsChartRef} />
                          </Box>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <Heading size="md">Financial Adjustments Distribution</Heading>
                        </CardHeader>
                        <CardBody>
                          <Box h="300px">
                            <canvas ref={adjustmentChartRef} />
                          </Box>
                        </CardBody>
                      </Card>
                    </Grid>
                  </TabPanel>
                  
                  <TabPanel px="0">
                    <Card mb="6">
                      <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Heading size="md">Detailed Meal Attendance</Heading>
                          <InputGroup maxW="300px">
                            <InputLeftElement pointerEvents="none">
                              <FiSearch color="gray.300" />
                            </InputLeftElement>
                            <Input placeholder="Search by student or room..." />
                          </InputGroup>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <Box overflowX="auto">
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Student</Th>
                                <Th>Room</Th>
                                <Th>Breakfast</Th>
                                <Th>Lunch</Th>
                                <Th>Dinner</Th>
                                <Th>Total Attendance</Th>
                                <Th>Adjustment</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              <Tr>
                                <Td>Rahul Sharma</Td>
                                <Td>A-101</Td>
                                <Td>18/22 (82%)</Td>
                                <Td>20/22 (91%)</Td>
                                <Td>19/22 (86%)</Td>
                                <Td>57/66 (86%)</Td>
                                <Td>₹450</Td>
                              </Tr>
                              <Tr>
                                <Td>Priya Patel</Td>
                                <Td>B-205</Td>
                                <Td>20/22 (91%)</Td>
                                <Td>22/22 (100%)</Td>
                                <Td>21/22 (95%)</Td>
                                <Td>63/66 (95%)</Td>
                                <Td>₹120</Td>
                              </Tr>
                              <Tr>
                                <Td>Amit Kumar</Td>
                                <Td>A-110</Td>
                                <Td>15/22 (68%)</Td>
                                <Td>16/22 (73%)</Td>
                                <Td>14/22 (64%)</Td>
                                <Td>45/66 (68%)</Td>
                                <Td>₹840</Td>
                              </Tr>
                              <Tr>
                                <Td>Neha Singh</Td>
                                <Td>C-304</Td>
                                <Td>10/22 (45%)</Td>
                                <Td>22/22 (100%)</Td>
                                <Td>20/22 (91%)</Td>
                                <Td>52/66 (79%)</Td>
                                <Td>₹560</Td>
                              </Tr>
                              <Tr>
                                <Td>Vikram Mehta</Td>
                                <Td>B-112</Td>
                                <Td>20/22 (91%)</Td>
                                <Td>19/22 (86%)</Td>
                                <Td>18/22 (82%)</Td>
                                <Td>57/66 (86%)</Td>
                                <Td>₹450</Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </Box>
                      </CardBody>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <Heading size="md">Day-wise Attendance Summary</Heading>
                      </CardHeader>
                      <CardBody>
                        <Box overflowX="auto">
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Date</Th>
                                <Th>Breakfast</Th>
                                <Th>Lunch</Th>
                                <Th>Dinner</Th>
                                <Th>Daily Average</Th>
                                <Th>Food Prepared</Th>
                                <Th>Waste Reduction</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              <Tr>
                                <Td>May 15, 2024 (Mon)</Td>
                                <Td>75%</Td>
                                <Td>88%</Td>
                                <Td>85%</Td>
                                <Td>83%</Td>
                                <Td>85%</Td>
                                <Td>30%</Td>
                              </Tr>
                              <Tr>
                                <Td>May 16, 2024 (Tue)</Td>
                                <Td>82%</Td>
                                <Td>90%</Td>
                                <Td>87%</Td>
                                <Td>86%</Td>
                                <Td>88%</Td>
                                <Td>32%</Td>
                              </Tr>
                              <Tr>
                                <Td>May 17, 2024 (Wed)</Td>
                                <Td>78%</Td>
                                <Td>92%</Td>
                                <Td>83%</Td>
                                <Td>84%</Td>
                                <Td>86%</Td>
                                <Td>28%</Td>
                              </Tr>
                              <Tr>
                                <Td>May 18, 2024 (Thu)</Td>
                                <Td>85%</Td>
                                <Td>88%</Td>
                                <Td>86%</Td>
                                <Td>86%</Td>
                                <Td>88%</Td>
                                <Td>34%</Td>
                              </Tr>
                              <Tr>
                                <Td>May 19, 2024 (Fri)</Td>
                                <Td>80%</Td>
                                <Td>85%</Td>
                                <Td>82%</Td>
                                <Td>82%</Td>
                                <Td>84%</Td>
                                <Td>32%</Td>
                              </Tr>
                              <Tr>
                                <Td>May 20, 2024 (Sat)</Td>
                                <Td>70%</Td>
                                <Td>82%</Td>
                                <Td>75%</Td>
                                <Td>76%</Td>
                                <Td>78%</Td>
                                <Td>38%</Td>
                              </Tr>
                              <Tr>
                                <Td>May 21, 2024 (Sun)</Td>
                                <Td>68%</Td>
                                <Td>78%</Td>
                                <Td>70%</Td>
                                <Td>72%</Td>
                                <Td>75%</Td>
                                <Td>42%</Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </Box>
                      </CardBody>
                    </Card>
                  </TabPanel>
                  
                  {reportType === "financial-adjustments" && (
                    <TabPanel px="0">
                      <Card mb="6">
                        <CardHeader>
                          <Heading size="md">Student Financial Adjustments</Heading>
                        </CardHeader>
                        <CardBody>
                          <Text mb="4">
                            Based on the meal attendance data, the following financial adjustments are recommended for each student for the selected period:
                          </Text>
                          
                          <Box overflowX="auto">
                            <Table variant="simple">
                              <Thead>
                                <Tr>
                                  <Th>Student</Th>
                                  <Th>Room</Th>
                                  <Th>Total Meals</Th>
                                  <Th>Attended Meals</Th>
                                  <Th>Attendance Rate</Th>
                                  <Th>Adjustment Amount</Th>
                                  <Th>Status</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                <Tr>
                                  <Td>Rahul Sharma</Td>
                                  <Td>A-101</Td>
                                  <Td>66</Td>
                                  <Td>57</Td>
                                  <Td>86%</Td>
                                  <Td>₹450</Td>
                                  <Td>
                                    <Badge colorScheme="yellow">Pending</Badge>
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td>Priya Patel</Td>
                                  <Td>B-205</Td>
                                  <Td>66</Td>
                                  <Td>63</Td>
                                  <Td>95%</Td>
                                  <Td>₹120</Td>
                                  <Td>
                                    <Badge colorScheme="yellow">Pending</Badge>
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td>Amit Kumar</Td>
                                  <Td>A-110</Td>
                                  <Td>66</Td>
                                  <Td>45</Td>
                                  <Td>68%</Td>
                                  <Td>₹840</Td>
                                  <Td>
                                    <Badge colorScheme="yellow">Pending</Badge>
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td>Neha Singh</Td>
                                  <Td>C-304</Td>
                                  <Td>66</Td>
                                  <Td>52</Td>
                                  <Td>79%</Td>
                                  <Td>₹560</Td>
                                  <Td>
                                    <Badge colorScheme="yellow">Pending</Badge>
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td>Vikram Mehta</Td>
                                  <Td>B-112</Td>
                                  <Td>66</Td>
                                  <Td>57</Td>
                                  <Td>86%</Td>
                                  <Td>₹450</Td>
                                  <Td>
                                    <Badge colorScheme="yellow">Pending</Badge>
                                  </Td>
                                </Tr>
                              </Tbody>
                            </Table>
                          </Box>
                          
                          <Flex justify="flex-end" mt="4">
                            <Button leftIcon={<FiDollarSign />} colorScheme="green" mr="3">
                              Process All Adjustments
                            </Button>
                            <Button leftIcon={<FiDownload />} colorScheme="blue" variant="outline">
                              Export Adjustments
                            </Button>
                          </Flex>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <Heading size="md">Adjustment Policy Information</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="flex-start" spacing="4">
                            <Box>
                              <Heading size="sm" mb="2">Policy Guidelines</Heading>
                              <Text>
                                Financial adjustments are calculated based on actual meal attendance data. 
                                Students are eligible for refunds when their actual meal consumption falls below their 
                                prepaid meal plan levels.
                              </Text>
                            </Box>
                            
                            <Box>
                              <Heading size="sm" mb="2">Adjustment Tiers</Heading>
                              <HStack alignItems="flex-start" spacing="10" wrap="wrap">
                                <VStack align="flex-start" minW="200px" mb="4">
                                  <Text fontWeight="medium">No Adjustment</Text>
                                  <Text fontSize="sm">95% or higher attendance</Text>
                                </VStack>
                                
                                <VStack align="flex-start" minW="200px" mb="4">
                                  <Text fontWeight="medium">Small Adjustment</Text>
                                  <Text fontSize="sm">85-94% attendance</Text>
                                  <Text fontSize="sm">₹10 per missed meal</Text>
                                </VStack>
                                
                                <VStack align="flex-start" minW="200px" mb="4">
                                  <Text fontWeight="medium">Medium Adjustment</Text>
                                  <Text fontSize="sm">70-84% attendance</Text>
                                  <Text fontSize="sm">₹15 per missed meal</Text>
                                </VStack>
                                
                                <VStack align="flex-start" minW="200px" mb="4">
                                  <Text fontWeight="medium">Large Adjustment</Text>
                                  <Text fontSize="sm">Below 70% attendance</Text>
                                  <Text fontSize="sm">₹20 per missed meal</Text>
                                </VStack>
                              </HStack>
                            </Box>
                            
                            <Box>
                              <Heading size="sm" mb="2">Payment Process</Heading>
                              <Text>
                                Adjustments are processed at the end of each month and credited to the student's hostel account.
                                The credited amount can be used for future payments or withdrawn at the end of the semester.
                              </Text>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            )}
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Reports;
