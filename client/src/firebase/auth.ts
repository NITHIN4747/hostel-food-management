import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Register with email and password
export const registerWithEmail = async (
  email: string, 
  password: string, 
  displayName: string, 
  role: 'student' | 'admin' | 'kitchen' = 'student', 
  hostelRoom?: string
) => {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create a user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName,
      email,
      role,
      hostelRoom: hostelRoom || '',
      createdAt: new Date().toISOString() // Use ISO string for date to avoid serialization issues
    });
    
    return userCredential;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

// Reset password
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// Sign out
export const signOut = async () => {
  return await firebaseSignOut(auth);
};

// Get user data from Firestore
export const getUserData = async (user: FirebaseUser) => {
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};