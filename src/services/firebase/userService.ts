import { db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { UserData } from '../../types';

export const getUserByUserIdAndName = async (userId: string, name: string): Promise<{ id: string; data: UserData } | null> => {
  if (!db) return null;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('userId', '==', userId), where('name', '==', name));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
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
