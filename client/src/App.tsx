import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/not-found";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

interface PrivateRouteProps {
  component: React.ComponentType;
  path: string;
}

function PrivateRoute({ component: Component, path }: PrivateRouteProps) {
  const { currentUser, loading } = useAuth();
  
  // If auth is still loading, show nothing
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  // If user is logged in, render the component, otherwise redirect to login
  return (
    <Route
      path={path}
      component={currentUser ? Component : () => <Redirect to="/login" />}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/login" />} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <PrivateRoute path="/dashboard" component={StudentDashboard} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
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
