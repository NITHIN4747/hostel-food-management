import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

// Email and password sign in
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Register with email and password
export const registerWithEmail = async (email: string, password: string, displayName: string, role: string = "student", hostelRoom?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      email,
      displayName,
      role,
      hostelRoom: hostelRoom || "",
      photoURL: result.user.photoURL,
      createdAt: new Date()
    });
    
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Google sign in
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if first time login
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: "student", // Default role
        hostelRoom: "",
        createdAt: new Date()
      });
    }
    
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Get user data from Firestore
export const getUserData = async (user: FirebaseUser) => {
  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    } else {
      return { data: null, error: "User data not found" };
    }
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
