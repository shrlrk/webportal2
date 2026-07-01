import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  limit
} from 'firebase/firestore';
import { PostData } from '../../types';

const POSTS_COLLECTION = 'posts';

// 게시글 목록 조회
export const getPosts = async (
  category?: string, 
  subCategory?: string, 
  grade?: string,
  showOnMainOnly: boolean = false
): Promise<PostData[]> => {
  if (!db) return [];

  const postsRef = collection(db, POSTS_COLLECTION);
  let constraints: any[] = [];

  if (showOnMainOnly) {
    constraints.push(where('showOnMain', '==', true));
  } else {
    if (category) constraints.push(where('category', '==', category));
    if (subCategory) constraints.push(where('subCategory', '==', subCategory));
    if (grade) constraints.push(where('grade', '==', grade));
  }

  // 클라이언트 단에서 정렬을 수행하므로 orderBy를 제외합니다.
  // constraints.push(orderBy('createdAt', 'desc'));

  try {
    const q = query(postsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    let fetchedPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as PostData[];

    const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' 형식 (로컬 기준)
    
    // 1. 기간 필터링 (일반 조회와 메인 노출 모두 적용)
    fetchedPosts = fetchedPosts.filter(p => {
      // 시작일이 설정되어 있는데 오늘보다 미래면 숨김
      if (p.publishStartDate && todayStr < p.publishStartDate) return false;
      // 종료일이 설정되어 있는데 오늘보다 과거면 숨김 (단, noEndDate면 통과)
      if (!p.noEndDate && p.publishEndDate && todayStr > p.publishEndDate) return false;
      return true;
    });

    // 2. 중요 공지(isImportant) 최우선 정렬, 그 다음 작성일(최신순) 정렬
    fetchedPosts.sort((a, b) => {
      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;
      // createdAt은 Firestore Timestamp를 Date로 변환한 값
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    if (showOnMainOnly) {
      // 최대 5개까지만 노출
      fetchedPosts = fetchedPosts.slice(0, 5);
    }

    return fetchedPosts;
  } catch (err) {
    console.error('Error fetching posts:', err);
    // 복합 인덱스 생성이 필요한 경우 에러 발생 가능
    return [];
  }
};

// 게시글 작성
export const createPost = async (postData: Omit<PostData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  if (!db) return null;

  try {
    const postsRef = collection(db, POSTS_COLLECTION);
    
    console.log("Original postData received in createPost:", postData);

    const cleanData: any = { ...postData };
    for (const key in cleanData) {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    }

    const payload = {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log("Final payload for addDoc:", payload);

    const docRef = await addDoc(postsRef, payload);
    return docRef.id;
  } catch (err) {
    console.error('Error creating post:', err);
    return null;
  }
};

// 게시글 수정
export const updatePost = async (postId: string, updates: Partial<Omit<PostData, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
  if (!db) return false;

  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error('Error updating post:', err);
    return false;
  }
};

// 게시글 삭제
export const deletePost = async (postId: string): Promise<boolean> => {
  if (!db) return false;

  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting post:', err);
    return false;
  }
};
