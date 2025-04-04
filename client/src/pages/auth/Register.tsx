import { useState } from "react";
import { useLocation } from "wouter";
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Select,
  Stack,
  Text,
  useToast,
  FormErrorMessage,
  IconButton,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    role: "student",
    hostelRoom: "",
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    hostelRoom: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, loginWithGoogle } = useAuth();
  const [, navigate] = useLocation();
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!formData.displayName) {
      newErrors.displayName = "Name is required";
      isValid = false;
    }

    if (formData.role === "student" && !formData.hostelRoom) {
      newErrors.hostelRoom = "Hostel room is required for students";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const success = await register(
        formData.email, 
        formData.password, 
        formData.displayName, 
        formData.role, 
        formData.hostelRoom
      );
      
      if (success) {
        toast({
          title: "Account created.",
          description: "We've created your account for you.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to create your account. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to sign up with Google. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: "12", md: "24" }} px={{ base: "0", sm: "8" }}>
      <Stack spacing="8">
        <Stack spacing="6">
          <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
            <Heading size={{ base: "xl", md: "2xl" }}>Create your account</Heading>
            <Text color="gray.600">
              Already have an account? <Link href="/login" color="blue.500">Sign in</Link>
            </Text>
          </Stack>
        </Stack>

        <Box
          py={{ base: "0", sm: "8" }}
          px={{ base: "4", sm: "10" }}
          bg={{ base: "transparent", sm: "white" }}
          boxShadow={{ base: "none", sm: "md" }}
          borderRadius={{ base: "none", sm: "xl" }}
        >
          <form onSubmit={handleRegister}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl isInvalid={!!errors.displayName}>
                  <FormLabel htmlFor="displayName">Full Name</FormLabel>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                  />
                  {errors.displayName && <FormErrorMessage>{errors.displayName}</FormErrorMessage>}
                </FormControl>
                
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                </FormControl>
                
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
                </FormControl>
                
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>}
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="role">Role</FormLabel>
                  <Select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="warden">Warden</option>
                    <option value="admin">Admin</option>
                  </Select>
                </FormControl>
                
                {formData.role === "student" && (
                  <FormControl isInvalid={!!errors.hostelRoom}>
                    <FormLabel htmlFor="hostelRoom">Hostel Room</FormLabel>
                    <Input
                      id="hostelRoom"
                      name="hostelRoom"
                      value={formData.hostelRoom}
                      onChange={handleChange}
                      placeholder="e.g. A-101"
                    />
                    {errors.hostelRoom && <FormErrorMessage>{errors.hostelRoom}</FormErrorMessage>}
                  </FormControl>
                )}
              </Stack>
              
              <Stack spacing="4">
                <Button 
                  colorScheme="blue" 
                  type="submit" 
                  isLoading={loading}
                  loadingText="Creating account..."
                >
                  Sign up
                </Button>
                
                <HStack>
                  <Divider />
                  <Text fontSize="sm" color="gray.500">OR</Text>
                  <Divider />
                </HStack>
                
                <Button 
                  variant="outline" 
                  leftIcon={<FcGoogle />} 
                  onClick={handleGoogleRegister}
                  isLoading={loading && !formData.email}
                  loadingText="Signing up..."
                >
                  Sign up with Google
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default Register;
