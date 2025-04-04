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
import { FiUser, FiLock, FiUserCheck, FiHome } from 'react-icons/fi';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'student' | 'admin' | 'kitchen'>('student');
  const [hostelRoom, setHostelRoom] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !displayName) {
      return setError('Please fill in all required fields');
    }
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    // Validate email domain - must be @ksrce.ac.in
    if (!email.endsWith('@ksrce.ac.in')) {
      return setError('Email must be from the college domain (@ksrce.ac.in)');
    }
    
    try {
      setError('');
      setLoading(true);
      
      await register(email, password, {
        email,
        displayName,
        role,
        hostelRoom: role === 'student' ? hostelRoom : undefined
      });
      
      setSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect after a short delay
      setTimeout(() => {
        setLocation('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to register for the hostel meal system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                <AlertDescription>{success}</AlertDescription>
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
                  <Label htmlFor="displayName">Name</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FiUser />
                    </div>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Your full name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FiLock />
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                
                {role === 'student' && (
                  <div className="grid gap-2">
                    <Label htmlFor="hostelRoom">Hostel Room</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400">
                        <FiHome />
                      </div>
                      <Input
                        id="hostelRoom"
                        type="text"
                        placeholder="e.g., A-101"
                        value={hostelRoom}
                        onChange={(e) => setHostelRoom(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register'}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-gray-600 mt-2">
              Already have an account?{' '}
              <Button variant="link" className="p-0" onClick={() => setLocation('/login')}>
                Sign in
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;