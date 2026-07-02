import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { LibraryProgram, LibraryProgramApplication, UserData } from '../../types';

const PROGRAMS_COLLECTION = 'library_programs';
const APPLICATIONS_COLLECTION = 'library_program_applications';

export const getLibraryPrograms = async (): Promise<LibraryProgram[]> => {
  try {
    const q = query(collection(db, PROGRAMS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as LibraryProgram[];
  } catch (error) {
    console.error('Error fetching library programs:', error);
    return [];
  }
};

export const getLibraryProgram = async (id: string): Promise<LibraryProgram | null> => {
  try {
    const docRef = doc(db, PROGRAMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as LibraryProgram;
    }
    return null;
  } catch (error) {
    console.error('Error fetching library program:', error);
    return null;
  }
};

export const createLibraryProgram = async (program: Omit<LibraryProgram, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants' | 'status'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, PROGRAMS_COLLECTION), {
      ...program,
      currentParticipants: 0,
      status: '접수중',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating library program:', error);
    return null;
  }
};

export const updateLibraryProgram = async (id: string, data: Partial<LibraryProgram>): Promise<boolean> => {
  try {
    const docRef = doc(db, PROGRAMS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating library program:', error);
    return false;
  }
};

export const deleteLibraryProgram = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, PROGRAMS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting library program:', error);
    return false;
  }
};

export const applyForLibraryProgram = async (programId: string, currentUser: UserData): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const programRef = doc(db, PROGRAMS_COLLECTION, programId);
      const programSnap = await transaction.get(programRef);

      if (!programSnap.exists()) {
        throw new Error('프로그램이 존재하지 않습니다.');
      }

      const programData = programSnap.data() as LibraryProgram;

      if (programData.status === '마감') {
        throw new Error('이미 마감된 프로그램입니다.');
      }

      if (programData.currentParticipants >= programData.maxParticipants) {
        throw new Error('모집 인원이 초과되었습니다.');
      }

      // 중복 신청 확인
      const applicationsQuery = query(
        collection(db, APPLICATIONS_COLLECTION),
        where('programId', '==', programId),
        where('studentId', '==', currentUser.internalId)
      );
      const appDocs = await getDocs(applicationsQuery); // getDocs outside transaction is technically not locking the query, but enough for UI-level
      
      if (!appDocs.empty) {
        throw new Error('이미 신청한 프로그램입니다.');
      }

      // 트랜잭션 내에서 신청 내역 추가
      const newAppRef = doc(collection(db, APPLICATIONS_COLLECTION));
      transaction.set(newAppRef, {
        programId,
        studentId: currentUser.internalId,
        studentUserId: currentUser.userId,
        studentName: currentUser.name,
        studentGrade: currentUser.grade || null,
        appliedAt: serverTimestamp()
      });

      // 인원 증가
      transaction.update(programRef, {
        currentParticipants: programData.currentParticipants + 1,
        updatedAt: serverTimestamp(),
        status: (programData.currentParticipants + 1) >= programData.maxParticipants ? '마감' : '접수중'
      });

      return '신청이 완료되었습니다.';
    });

    return { success: true, message: result };
  } catch (error: any) {
    console.error('Error applying for library program:', error);
    return { success: false, message: error.message || '신청 처리 중 오류가 발생했습니다.' };
  }
};

export const cancelLibraryProgramApplication = async (programId: string, studentId: string): Promise<boolean> => {
  try {
    await runTransaction(db, async (transaction) => {
      const q = query(
        collection(db, APPLICATIONS_COLLECTION),
        where('programId', '==', programId),
        where('studentId', '==', studentId)
      );
      // NOTE: For true transaction safety on queries, we usually query outside, get docRef, then transact.
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('신청 내역이 없습니다.');
      }
      
      const appDoc = snapshot.docs[0];
      const programRef = doc(db, PROGRAMS_COLLECTION, programId);
      const programSnap = await transaction.get(programRef);
      
      if (!programSnap.exists()) {
        throw new Error('프로그램이 존재하지 않습니다.');
      }

      const programData = programSnap.data() as LibraryProgram;

      transaction.delete(appDoc.ref);
      
      const newCount = Math.max(0, programData.currentParticipants - 1);
      transaction.update(programRef, {
        currentParticipants: newCount,
        status: newCount < programData.maxParticipants ? '접수중' : '마감',
        updatedAt: serverTimestamp(),
      });
    });
    return true;
  } catch (error) {
    console.error('Error canceling library program application:', error);
    return false;
  }
};

export const getProgramApplications = async (programId: string): Promise<LibraryProgramApplication[]> => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('programId', '==', programId),
      orderBy('appliedAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate(),
    })) as LibraryProgramApplication[];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

export const getMyProgramApplications = async (studentId: string): Promise<LibraryProgramApplication[]> => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('appliedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate(),
    })) as LibraryProgramApplication[];
  } catch (error) {
    console.error('Error fetching my applications:', error);
    return [];
  }
};
