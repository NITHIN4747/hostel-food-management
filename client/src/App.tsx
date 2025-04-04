import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/not-found";
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import KitchenDashboard from "./pages/dashboard/KitchenDashboard";
import LeaveRequestPage from "./pages/leave/LeaveRequestPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  component: React.ComponentType;
  path: string;
  adminOnly?: boolean;
  kitchenOnly?: boolean;
  studentOnly?: boolean;
}

function PrivateRoute({ 
  component: Component, 
  path, 
  adminOnly = false,
  kitchenOnly = false,
  studentOnly = false 
}: PrivateRouteProps) {
  const { currentUser, userData, loading } = useAuth();
  
  // If auth is still loading, show loading spinner
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  // Role-based access control
  if (adminOnly && userData?.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }

  if (kitchenOnly && userData?.role !== 'kitchen') {
    return <Redirect to="/dashboard" />;
  }

  if (studentOnly && userData?.role !== 'student') {
    return <Redirect to="/dashboard" />;
  }
  
  // If all checks pass, render the component
  return <Route path={path}><Component /></Route>;
}

function RoleDashboardRedirect() {
  const { userData, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }
  
  // Redirect to the appropriate dashboard based on user role
  switch (userData?.role) {
    case 'admin':
      return <Redirect to="/admin/dashboard" />;
    case 'kitchen':
      return <Redirect to="/kitchen/dashboard" />;
    case 'student':
      return <Redirect to="/student/dashboard" />;
    default:
      return <Redirect to="/login" />;
  }
}

function Router() {
  const { userData } = useAuth();
  
  return (
    <Switch>
      <Route path="/"><Redirect to="/dashboard" /></Route>
      <Route path="/login"><Login /></Route>
      
      {/* Role-specific dashboards */}
      <PrivateRoute path="/dashboard" component={RoleDashboardRedirect} />
      <PrivateRoute path="/student/dashboard" component={StudentDashboard} studentOnly />
      <PrivateRoute path="/admin/dashboard" component={AdminDashboard} adminOnly />
      <PrivateRoute path="/kitchen/dashboard" component={KitchenDashboard} kitchenOnly />
      
      {/* Common routes accessible to all authenticated users */}
      <PrivateRoute path="/leave-requests" component={LeaveRequestPage} />
      
      {/* Fallback to 404 */}
      <Route><NotFound /></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
