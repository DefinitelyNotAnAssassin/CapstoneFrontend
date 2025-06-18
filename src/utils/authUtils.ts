import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";

/**
 * Creates a new Firebase user with email and password
 * This is used during employee creation to set up authentication
 * 
 * @param email - The employee's email address
 * @param password - The employee's password
 * @param displayName - The employee's full name for the user profile
 * @returns The Firebase user object
 */
export const createAuthUser = async (email: string, password: string, displayName: string) => {
  try {
    // Create the user account in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user profile with the display name
    await updateProfile(user, {
      displayName: displayName
    });
    
    return user;
  } catch (error) {
    console.error("Error creating user authentication:", error);
    throw error;
  }
};

/**
 * Gets the Firebase Auth user ID for the provided email
 * This can be used to link the employee record to their auth account
 * 
 * @param email - The email address to check
 * @returns The Firebase user ID if found
 */
export const getAuthUserIdByEmail = async (email: string): Promise<string | null> => {
  try {
    // Note: Firebase doesn't provide a direct way to get a user by email
    // In a production app, you would use Firebase Admin SDK on the server side
    // This is a simplified approach for demo purposes
    return null;
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
};
