import { db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserData } from '../../types';

// 아이디(userId) 기반으로 사용자 조회 (문서 ID가 internalId로 변경됨)
export const getUserByUserId = async (userId: string): Promise<{ id: string; data: UserData } | null> => {
  if (!db) return null;
  
  const searchUserId = String(userId).trim();
  console.log(`[userService] getUserByUserId 호출됨. 검색할 userId: "${searchUserId}" (타입: ${typeof searchUserId})`);
  
  const usersRef = collection(db, 'users');
  
  // 1. 문자열로 먼저 조회
  const qStr = query(usersRef, where('userId', '==', searchUserId));
  const snapshotStr = await getDocs(qStr);
  
  if (!snapshotStr.empty) {
    console.log(`[userService] 문자열 조회 성공`);
    const docSnap = snapshotStr.docs[0];
    return { id: docSnap.id, data: docSnap.data() as UserData };
  }
  
  // 2. 숫자로도 조회 시도 (Firestore에 숫자로 저장된 기존 계정 대응)
  if (!isNaN(Number(searchUserId))) {
    const qNum = query(usersRef, where('userId', '==', Number(searchUserId)));
    const snapshotNum = await getDocs(qNum);
    
    if (!snapshotNum.empty) {
      console.log(`[userService] 숫자 조회 성공`);
      const docSnap = snapshotNum.docs[0];
      return { id: docSnap.id, data: docSnap.data() as UserData };
    }
  }
  
  console.log(`[userService] 계정을 찾을 수 없습니다. (${searchUserId})`);
  return null;
};

export const getUserDataByUid = async (uid: string): Promise<UserData | null> => {
  if (!db) return null;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('uid', '==', uid));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as UserData;
};

export const completeUserVerification = async (docId: string, uid: string) => {
  if (!db) return;
  const userRef = doc(db, 'users', docId); // docId is now internalId
  await updateDoc(userRef, {
    uid,
    passwordSet: true,
    updatedAt: serverTimestamp()
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
  if (isAdmin(user)) return true;
  return user.internalId === postAuthorInternalId;
};

// 관리자 권한 확인 (사용자 관리, 게시글 통합 관리 등)
export const isAdmin = (user: UserData | null): boolean => {
  if (!user) return false;
  return user.userType === 'T' && user.role === 'admin';
};

/* 
  [학생 진급 시 유의사항 - 원칙]
  학생이 다음 학년도에 진급하더라도 internalId(예: S000001)는 절대 변경하지 않습니다.
  새 학번이 부여되면 userId만 변경(예: 10101 -> 20101)합니다.
  즐겨찾기, 신청기록, 활동기록 등 모든 개인화된 데이터는 userId가 아닌 internalId를 기준으로 저장되어야 합니다.
*/
