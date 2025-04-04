import { Switch, Route } from "wouter";
import { ChakraProvider } from "@chakra-ui/react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import AttendanceTracking from "./pages/attendance/AttendanceTracking";
import MealTracking from "./pages/meals/MealTracking";
import Reports from "./pages/reports/Reports";
import LeaveManagement from "./pages/leave/LeaveManagement";
import UserManagement from "./pages/admin/UserManagement";
import Settings from "./pages/admin/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <PrivateRoute component={Dashboard} />
      </Route>
      <Route path="/attendance">
        <PrivateRoute component={AttendanceTracking} />
      </Route>
      <Route path="/meals">
        <PrivateRoute component={MealTracking} />
      </Route>
      <Route path="/reports">
        <PrivateRoute component={Reports} />
      </Route>
      <Route path="/leave">
        <PrivateRoute component={LeaveManagement} />
      </Route>
      <Route path="/users">
        <PrivateRoute component={UserManagement} />
      </Route>
      <Route path="/settings">
        <PrivateRoute component={Settings} />
      </Route>
      
      {/* Redirect root to dashboard or login */}
      <Route path="/">
        <PrivateRoute component={Dashboard} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
