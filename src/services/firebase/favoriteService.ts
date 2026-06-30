import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';

// 사용자의 즐겨찾기 목록 조회
export const getUserFavorites = async (internalId: string): Promise<string[]> => {
  if (!db) return [];
  const favoritesRef = collection(db, 'users', internalId, 'favorites');
  const snapshot = await getDocs(favoritesRef);
  return snapshot.docs.map(doc => doc.id);
};

// 즐겨찾기 추가/해제 토글
export const toggleFavorite = async (internalId: string, postId: string): Promise<boolean> => {
  if (!db) return false;
  const favoriteDocRef = doc(db, 'users', internalId, 'favorites', postId);
  
  const snap = await getDoc(favoriteDocRef);
  if (snap.exists()) {
    // 이미 즐겨찾기 상태면 삭제
    await deleteDoc(favoriteDocRef);
    return false; // 즐겨찾기 해제됨
  } else {
    // 없으면 생성
    await setDoc(favoriteDocRef, { addedAt: serverTimestamp() });
    return true; // 즐겨찾기 추가됨
  }
};
