import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiUser, FiLock, FiUserCheck } from 'react-icons/fi';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin' | 'kitchen'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Please enter both email and password');
    }
    
    // For testing purposes, we're temporarily relaxing this validation
    // In production, uncomment this to validate the college email domain
    /*
    if (!email.endsWith('@ksrce.ac.in')) {
      return setError('Email must be from the college domain (@ksrce.ac.in)');
    }
    */
    
    try {
      setError('');
      setLoading(true);
      
      // Login the user with the selected role
      await login(email, password, role);
      
      // Redirect based on role
      switch (role) {
        case 'admin':
          setLocation('/admin/dashboard');
          break;
        case 'kitchen':
          setLocation('/kitchen/dashboard');
          break;
        case 'student':
        default:
          setLocation('/student/dashboard');
          break;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide specific error messages based on Firebase error codes
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please register first.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else {
        setError(`Login failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Hostel Meal System</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FiUser />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="youremail@ksrce.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FiLock />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FiUserCheck />
                    </div>
                    <Select
                      value={role}
                      onValueChange={(value: 'student' | 'admin' | 'kitchen') => setRole(value)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="kitchen">Kitchen Supervisor</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-gray-600 mt-2">
              Don't have an account?{' '}
              <Button variant="link" className="p-0" onClick={() => setLocation('/register')}>
                Register now
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;