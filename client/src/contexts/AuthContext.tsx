import { createContext, useState, useEffect, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserData } from "../firebase/auth";
import { useToast } from "@chakra-ui/react";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  hostelRoom?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  setUserData: (data: UserData) => void;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  setUserData: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const { data, error } = await getUserData(user);
          
          if (error) {
            toast({
              title: "Error fetching user data",
              description: error,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          } else if (data) {
            setUserData(data as UserData);
          }
        } catch (err) {
          console.error("Error in auth state change:", err);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const value = {
    currentUser,
    userData,
    loading,
    setUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
