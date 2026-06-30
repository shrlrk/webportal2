import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserData } from '../../types';

// 아이디(userId) 기반으로 사용자 조회 (문서 ID가 internalId로 변경됨)
export const getUserByUserId = async (userId: string): Promise<{ id: string; data: UserData } | null> => {
  if (!db) return null;
  
  const searchUserId = String(userId).trim();
  console.log(`[userService] getUserByUserId 호출됨. 검색할 userId: "${searchUserId}" (타입: ${typeof searchUserId})`);
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('userId', '==', searchUserId));
  const snapshot = await getDocs(q);
  
  console.log(`[userService] Firestore 조회 직후 snapshot.size: ${snapshot.size}`);
  
  if (snapshot.empty) {
    console.log(`[userService] snapshot이 0건입니다. 조회 조건: where("userId", "==", "${searchUserId}")`);
    return null;
  }
  
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
  const userRef = doc(db, 'users', docId); // docId is now internalId
  await updateDoc(userRef, {
    uid,
    passwordSet: true
  });
};

// --- RBAC (Role-Based Access Control) 유틸 함수 ---

// 게시글 작성 권한: 교사(teacher) 또는 관리자(admin)
export const canWritePost = (user: UserData | null): boolean => {
  if (!user) return false;
  return user.userType === 'T' && (user.role === 'teacher' || user.role === 'admin');
};

// 게시글 수정/삭제 권한: 작성자 본인이거나 관리자(admin)
export const canEditOrDeletePost = (user: UserData | null, postAuthorInternalId: string): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.internalId === postAuthorInternalId;
};
