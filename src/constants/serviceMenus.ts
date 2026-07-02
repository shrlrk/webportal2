export type ServiceType = 'BOARD' | 'APPLICATION' | 'CALENDAR';

export interface ServiceMenuItem {
  id: string;
  title: string;
  type: ServiceType;
}

export interface DepartmentMenu {
  id: string;
  title: string;
  menus: ServiceMenuItem[];
}

export const SUPPORT_MENUS: Record<string, DepartmentMenu> = {
  wee: {
    id: 'wee',
    title: 'Wee클래스',
    menus: [
      { id: 'notice', title: '공지사항', type: 'BOARD' },
      { id: 'counseling', title: '상담 신청', type: 'APPLICATION' },
      { id: 'test', title: '심리검사', type: 'BOARD' },
      { id: 'materials', title: '마음건강 자료', type: 'BOARD' },
    ]
  },
  health: {
    id: 'health',
    title: '보건실',
    menus: [
      { id: 'notice', title: '공지사항', type: 'BOARD' },
      { id: 'info', title: '건강정보', type: 'BOARD' },
      { id: 'infection', title: '감염병 안내', type: 'BOARD' },
      { id: 'vaccine', title: '예방접종 안내', type: 'BOARD' },
    ]
  },
  library: {
    id: 'library',
    title: '꿈마루도서관',
    menus: [
      { id: 'notice', title: '공지사항', type: 'BOARD' },
      { id: 'newbooks', title: '신착도서', type: 'BOARD' },
      { id: 'search', title: '도서검색', type: 'BOARD' },
      { id: 'request', title: '희망도서 신청', type: 'APPLICATION' },
      { id: 'program', title: '프로그램 신청', type: 'APPLICATION' },
      { id: 'suggestion', title: '도서관 의견함', type: 'APPLICATION' },
    ]
  },
  cafeteria: {
    id: 'cafeteria',
    title: '학생식당',
    menus: [
      { id: 'notice', title: '공지사항', type: 'BOARD' },
      { id: 'diet', title: '월간 식단', type: 'CALENDAR' },
      { id: 'nutrition', title: '영양정보', type: 'BOARD' },
      { id: 'allergy', title: '알레르기 정보', type: 'BOARD' },
      { id: 'suggestion', title: '급식 의견함', type: 'APPLICATION' },
    ]
  }
};
