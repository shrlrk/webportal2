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

import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  if (!auth?.currentUser) throw new Error("로그인된 사용자가 없습니다.");
  const email = `${userId}${DUMMY_DOMAIN}`;
  const credential = EmailAuthProvider.credential(email, currentPassword);
  
  await reauthenticateWithCredential(auth.currentUser, credential);
  await updatePassword(auth.currentUser, newPassword);
};
