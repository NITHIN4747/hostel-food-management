import { useState } from "react";
import { useLocation } from "wouter";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const { login, loginWithGoogle } = useAuth();
  const [, navigate] = useLocation();
  const toast = useToast();

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to log in. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to log in with Google. Please try again.",
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
            <Heading size={{ base: "xl", md: "2xl" }}>Log in to your account</Heading>
            <Text color="gray.600">
              Don't have an account? <Link href="/register" color="blue.500">Sign up</Link>
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
          <form onSubmit={handleLogin}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl isInvalid={!!emailError}>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
                </FormControl>
                
                <FormControl isInvalid={!!passwordError}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  {passwordError && <FormErrorMessage>{passwordError}</FormErrorMessage>}
                </FormControl>
              </Stack>
              
              <HStack justify="space-between">
                <Checkbox defaultChecked>Remember me</Checkbox>
                <Link href="/forgot-password" color="blue.500" fontSize="sm" fontWeight="semibold">
                  Forgot password?
                </Link>
              </HStack>
              
              <Stack spacing="4">
                <Button 
                  colorScheme="blue" 
                  type="submit" 
                  isLoading={loading}
                  loadingText="Logging in..."
                >
                  Sign in
                </Button>
                
                <HStack>
                  <Divider />
                  <Text fontSize="sm" color="gray.500">OR</Text>
                  <Divider />
                </HStack>
                
                <Button 
                  variant="outline" 
                  leftIcon={<FcGoogle />} 
                  onClick={handleGoogleLogin}
                  isLoading={loading && !email && !password}
                  loadingText="Logging in..."
                >
                  Sign in with Google
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default Login;
