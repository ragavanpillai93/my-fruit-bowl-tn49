import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getAdminUser, registerAdminUserRecord } from './firestoreService';
import { AdminUserRecord } from '../types';

export interface AdminAuthResult {
  user: User;
  adminRecord?: AdminUserRecord | null;
}

/**
 * Log in admin using Email & Password via Firebase Authentication.
 * Verifies UID and administrative status in Firestore.
 */
export const loginAdmin = async (
  email: string,
  pass: string
): Promise<AdminAuthResult> => {
  const cleanEmail = email.trim();
  if (!cleanEmail || !pass) {
    throw new Error('Please enter both your Admin Email and Password.');
  }

  // 1. Authenticate with Firebase Authentication
  const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const user = cred.user;

  if (!user || !user.uid) {
    throw new Error('Authentication failed. No valid user token returned.');
  }

  // 2. Fetch or initialize admin authorization record in Firestore
  let adminRecord = await getAdminUser(user.uid);

  if (adminRecord) {
    // Check if account status is active
    if ((adminRecord as any).status === 'disabled' || adminRecord.role === ('disabled' as any)) {
      await signOut(auth);
      throw new Error('Access Denied: Your admin account has been deactivated. Please contact the kitchen manager.');
    }
  } else {
    // Register the admin user profile upon first successful Firebase Auth verification
    adminRecord = await registerAdminUserRecord(
      user.uid,
      user.email || cleanEmail,
      user.displayName || undefined,
      'kitchen_admin'
    );
  }

  return {
    user,
    adminRecord,
  };
};

/**
 * Register a new kitchen operations admin in Firebase Auth & Firestore
 */
export const registerAdmin = async (
  email: string,
  pass: string,
  displayName?: string
): Promise<AdminAuthResult> => {
  const cleanEmail = email.trim();
  if (!cleanEmail || !pass) {
    throw new Error('Please provide an admin email and password.');
  }
  if (pass.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  const user = cred.user;

  const adminRecord = await registerAdminUserRecord(
    user.uid,
    cleanEmail,
    displayName,
    'kitchen_admin'
  );

  return {
    user,
    adminRecord,
  };
};

/**
 * Log out current admin user from Firebase Authentication
 */
export const logoutAdmin = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Send password reset email via Firebase Authentication
 */
export const resetAdminPassword = async (email: string): Promise<void> => {
  const cleanEmail = email.trim();
  if (!cleanEmail) {
    throw new Error('Please provide your admin email address.');
  }
  await sendPasswordResetEmail(auth, cleanEmail);
};

/**
 * Listen to Firebase Authentication state changes
 */
export const subscribeAdminAuthState = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

