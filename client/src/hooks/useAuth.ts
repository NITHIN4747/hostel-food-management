import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useToast } from "@chakra-ui/react";
import { 
  signInWithEmail, 
  registerWithEmail, 
  signInWithGoogle, 
  resetPassword, 
  signOut 
} from "../firebase/auth";

export const useAuth = () => {
  const { currentUser, userData, loading, setUserData } = useContext(AuthContext);
  const toast = useToast();

  const login = async (email: string, password: string) => {
    const { user, error } = await signInWithEmail(email, password);
    
    if (error) {
      toast({
        title: "Login failed",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    toast({
      title: "Login successful",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    return true;
  };

  const loginWithGoogle = async () => {
    const { user, error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: "Google login failed",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    toast({
      title: "Login successful",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    return true;
  };

  const register = async (email: string, password: string, displayName: string, role: string = "student", hostelRoom?: string) => {
    const { user, error } = await registerWithEmail(email, password, displayName, role, hostelRoom);
    
    if (error) {
      toast({
        title: "Registration failed",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    toast({
      title: "Registration successful",
      description: "Your account has been created.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    return true;
  };

  const forgotPassword = async (email: string) => {
    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        title: "Password reset failed",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    toast({
      title: "Password reset email sent",
      description: "Check your email for password reset instructions.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    return true;
  };

  const logout = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: "Logout failed",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    return true;
  };

  return {
    currentUser,
    userData,
    loading,
    login,
    loginWithGoogle,
    register,
    forgotPassword,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin: userData?.role === "admin",
    isWarden: userData?.role === "warden" || userData?.role === "admin",
    isStudent: userData?.role === "student",
  };
};
