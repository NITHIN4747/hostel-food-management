import { useEffect } from "react";
import { useLocation } from "wouter";
import { Box, Spinner, Center } from "@chakra-ui/react";
import { useAuth } from "../../hooks/useAuth";

interface PrivateRouteProps {
  component: React.ComponentType;
  adminOnly?: boolean;
}

const PrivateRoute = ({ component: Component, adminOnly = false }: PrivateRouteProps) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setLocation("/login");
      } else if (adminOnly && !isAdmin) {
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, loading, adminOnly, isAdmin, setLocation]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (adminOnly && !isAdmin) {
    return null;
  }

  return <Component />;
};

export default PrivateRoute;
