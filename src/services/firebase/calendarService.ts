import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp, 
} from 'firebase/firestore';
import { CalendarData } from '../../types';

const CALENDAR_COLLECTION = 'calendar_events';

// 특정 부서 및 해당 월의 이벤트 조회
export const getCalendarEvents = async (
  department: string, 
  yearMonth: string // "YYYY-MM" 형식
): Promise<CalendarData[]> => {
  if (!db) return [];

  try {
    const eventsRef = collection(db, CALENDAR_COLLECTION);
    // startsWith 쿼리 에뮬레이션을 위한 범위 설정
    const startStr = `${yearMonth}-01`;
    const endStr = `${yearMonth}-31\uf8ff`;

    const q = query(
      eventsRef, 
      where('department', '==', department),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CalendarData[];
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    return [];
  }
};

// 일괄 데이터 업로드 (CSV 등)
export const bulkUploadCalendarEvents = async (
  department: string,
  events: Array<{ date: string; data: any }>
): Promise<boolean> => {
  if (!db) return false;

  try {
    // Note: Firestore의 Batch Write는 최대 500개 제한이 있으나, 
    // 한 달 식단은 보통 20~30건이므로 Promise.all로 개별 setDoc 처리 (또는 batch 사용)
    const promises = events.map(event => {
      const docId = `${department}_${event.date}`;
      const docRef = doc(db, CALENDAR_COLLECTION, docId);
      return setDoc(docRef, {
        department,
        date: event.date,
        data: event.data,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });

    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error('Error in bulkUploadCalendarEvents:', err);
    return false;
  }
};
