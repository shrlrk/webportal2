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

  // 최신순 정렬
  constraints.push(orderBy('createdAt', 'desc'));

  try {
    const q = query(postsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    let fetchedPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as PostData[];

    if (showOnMainOnly) {
      const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' 형식 (로컬 기준)
      fetchedPosts = fetchedPosts.filter(p => {
        if (!p.mainStartDate || !p.mainEndDate) return false;
        return todayStr >= p.mainStartDate && todayStr <= p.mainEndDate;
      });
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
