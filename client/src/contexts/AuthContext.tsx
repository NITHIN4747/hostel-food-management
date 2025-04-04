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
  role: 'student' | 'admin' | 'kitchen';
  hostelRoom?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  login: (email: string, password: string, role?: 'student' | 'admin' | 'kitchen') => Promise<void>;
  register: (email: string, password: string, data: Omit<UserData, 'uid'>) => Promise<any>;
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

  const login = async (email: string, password: string, role?: 'student' | 'admin' | 'kitchen') => {
    // First authenticate the user
    const userCredential = await signInWithEmail(email, password);
    
    // If role is provided, update the user's role in Firestore
    if (role && userCredential.user) {
      const user = userCredential.user;
      
      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Only update if role doesn't match
        if (userData.role !== role) {
          await setDoc(doc(db, 'users', user.uid), {
            ...userData,
            role: role
          }, { merge: true });
        }
      } else {
        // Create new user document with the selected role
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          role: role
        });
      }
      
      // Refresh user data
      await fetchUserData(user);
    }
  };

  const register = async (email: string, password: string, data: Omit<UserData, 'uid'>) => {
    try {
      const userCredential = await registerUser(email, password, data.displayName, data.role, data.hostelRoom);
      const user = userCredential.user;
      
      // Add user to Firestore with explicit fields instead of spreading the data object
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        ...(data.hostelRoom ? { hostelRoom: data.hostelRoom } : {})
      });
      
      return userCredential;
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      throw error;
    }
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