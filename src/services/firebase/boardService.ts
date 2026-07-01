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
  isMainNoticeOnly: boolean = false
): Promise<PostData[]> => {
  if (!db) return [];

  const postsRef = collection(db, POSTS_COLLECTION);
  let constraints: any[] = [];

  if (isMainNoticeOnly) {
    constraints.push(where('isMainNotice', '==', true));
  } else {
    if (category) constraints.push(where('category', '==', category));
    if (subCategory) constraints.push(where('subCategory', '==', subCategory));
    if (grade) constraints.push(where('grade', '==', grade));
  }

  // 최신순 정렬
  constraints.push(orderBy('createdAt', 'desc'));

  // 메인 공지는 5개까지만 가져오도록 제한
  if (isMainNoticeOnly) {
    constraints.push(limit(5));
  }

  try {
    const q = query(postsRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as PostData[];
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
    const docRef = await addDoc(postsRef, {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
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
    await updateDoc(docRef, {
      ...updates,
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
