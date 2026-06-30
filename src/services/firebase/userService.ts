import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserData } from '../../types';

export const getUserByUserId = async (userId: string): Promise<{ id: string; data: UserData } | null> => {
  if (!db) return null;
  const userRef = doc(db, 'users', String(userId));
  const docSnap = await getDoc(userRef);
  
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, data: docSnap.data() as UserData };
};

export const getUserDataByUid = async (uid: string): Promise<UserData | null> => {
  if (!db) return null;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('uid', '==', uid));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as UserData;
};

export const updateUserUidAndPasswordSet = async (docId: string, uid: string) => {
  if (!db) return;
  const userRef = doc(db, 'users', docId);
  await updateDoc(userRef, {
    uid,
    passwordSet: true
  });
};
