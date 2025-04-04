import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { 
  signInWithEmail, 
  registerWithEmail as registerUser, 
  signOut as authSignOut, 
  getUserData
} from '../firebase/auth';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'admin';
  hostelRoom?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, data: Omit<UserData, 'uid'>) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loading: true
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const register = async (email: string, password: string, data: Omit<UserData, 'uid'>) => {
    const userCredential = await registerUser(email, password, data.displayName, data.role, data.hostelRoom);
    const user = userCredential.user;
    
    // Add user to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      ...data
    });
  };

  const logout = async () => {
    await authSignOut();
  };

  // Fetch user data from Firestore
  const fetchUserData = async (user: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        setUserData(userData);
      } else {
        console.log('No user data found in Firestore');
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};