import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
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

const TestCreateUser: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [, setLocation] = useLocation();

  // Default test user credentials
  const testEmail = 'test@example.com';
  const testPassword = 'Test123456';
  const testName = 'Test User';
  const testRole = 'admin';
  
  const createTestUser = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: testEmail,
        displayName: testName,
        role: testRole
      });
      
      setMessage(`Test user created successfully! Email: ${testEmail}, Password: ${testPassword}`);
    } catch (error: any) {
      console.error('Error creating test user:', error);
      setError(`Failed to create test user: ${error.message || error.code || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Create Test User</CardTitle>
            <CardDescription className="text-center">
              This page is for testing only and will create a test user account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <p className="mb-2"><strong>Email:</strong> {testEmail}</p>
                <p className="mb-2"><strong>Password:</strong> {testPassword}</p>
                <p className="mb-2"><strong>Name:</strong> {testName}</p>
                <p className="mb-2"><strong>Role:</strong> {testRole}</p>
              </div>
              
              <Button
                onClick={createTestUser}
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating Test User...' : 'Create Test User'}
              </Button>
              
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setLocation('/login')}
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-red-500">
              For development purposes only. Remove in production.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TestCreateUser;