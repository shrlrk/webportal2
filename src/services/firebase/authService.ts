import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const DUMMY_DOMAIN = '@dy365.edu';

export const loginWithUserIdAndPassword = async (userId: string, password: string) => {
  if (!auth) throw new Error("Firebase Auth is not initialized");
  const email = `${userId}${DUMMY_DOMAIN}`;
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithUserIdAndPassword = async (userId: string, password: string) => {
  if (!auth) throw new Error("Firebase Auth is not initialized");
  const email = `${userId}${DUMMY_DOMAIN}`;
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  if (!auth) throw new Error("Firebase Auth is not initialized");
  return signOut(auth);
};
