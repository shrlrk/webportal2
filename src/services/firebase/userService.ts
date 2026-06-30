import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserData } from '../../types';

// 아이디(userId) 기반으로 사용자 조회 (문서 ID가 internalId로 변경됨)
export const getUserByUserId = async (userId: string): Promise<{ id: string; data: UserData } | null> => {
  if (!db) return null;
  
  const searchUserId = String(userId).trim();
  console.log(`[userService] [STEP 0] getUserByUserId 호출됨. 검색할 userId: "${searchUserId}"`);
  
  const usersRef = collection(db, 'users');
  
  // 1. 문자열로 먼저 조회
  try {
    const qStr = query(usersRef, where('userId', '==', searchUserId));
    const snapshotStr = await getDocs(qStr);
    console.log(`[userService] [STEP 1] 문자열 조회 결과 (userId === "${searchUserId}"): ${snapshotStr.size}건`);
    if (!snapshotStr.empty) {
      return { id: snapshotStr.docs[0].id, data: snapshotStr.docs[0].data() as UserData };
    }
  } catch (err) { console.error('[STEP 1 Error]', err); }
  
  // 2. 숫자로도 조회 시도
  try {
    if (!isNaN(Number(searchUserId))) {
      const qNum = query(usersRef, where('userId', '==', Number(searchUserId)));
      const snapshotNum = await getDocs(qNum);
      console.log(`[userService] [STEP 2] 숫자 조회 결과 (userId === ${Number(searchUserId)}): ${snapshotNum.size}건`);
      if (!snapshotNum.empty) {
        return { id: snapshotNum.docs[0].id, data: snapshotNum.docs[0].data() as UserData };
      }
    }
  } catch (err) { console.error('[STEP 2 Error]', err); }

  // 3. internalId 필드로 조회
  try {
    const qInternal = query(usersRef, where('internalId', '==', searchUserId));
    const snapshotInternal = await getDocs(qInternal);
    console.log(`[userService] [STEP 3] internalId 조회 결과: ${snapshotInternal.size}건`);
    if (!snapshotInternal.empty) {
      return { id: snapshotInternal.docs[0].id, data: snapshotInternal.docs[0].data() as UserData };
    }
  } catch (err) { console.error('[STEP 3 Error]', err); }

  // 4. 문서 ID로 직접 조회
  try {
    const docRef = doc(db, 'users', searchUserId);
    const directDocSnap = await getDoc(docRef);
    console.log(`[userService] [STEP 4] 문서 ID 직접 조회 결과: exists=${directDocSnap.exists()}`);
    if (directDocSnap.exists()) {
      return { id: directDocSnap.id, data: directDocSnap.data() as UserData };
    }
  } catch (err) { console.error('[STEP 4 Error]', err); }

  // 5. previousUserIds 배열 내에서 검색
  try {
    const qPrev = query(usersRef, where('previousUserIds', 'array-contains', searchUserId));
    const snapshotPrev = await getDocs(qPrev);
    console.log(`[userService] [STEP 5] previousUserIds 조회 결과: ${snapshotPrev.size}건`);
    if (!snapshotPrev.empty) {
      return { id: snapshotPrev.docs[0].id, data: snapshotPrev.docs[0].data() as UserData };
    }
  } catch (err) { console.error('[STEP 5 Error]', err); }

  // 6. 최후의 수단: 모든 유저 데이터를 가져와서 메모리에서 직접 필터링 (Firestore array-contains 인덱스 문제 등 우회)
  try {
    const snapshotAll = await getDocs(usersRef);
    const docSnap = snapshotAll.docs.find(d => {
      const data = d.data();
      return (
        data.userId === searchUserId || 
        String(data.userId) === searchUserId ||
        (Array.isArray(data.previousUserIds) && data.previousUserIds.includes(searchUserId))
      );
    });
    
    if (docSnap) {
      console.log(`[userService] [STEP 6] 전체 문서 JS 필터링으로 조회 성공: ${docSnap.id}`);
      return { id: docSnap.id, data: docSnap.data() as UserData };
    }
  } catch (err) { console.error('[STEP 6 Error]', err); }
  
  console.log(`[userService] [STEP 7] 모든 조회 실패. null 반환`);
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
