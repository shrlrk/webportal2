export interface UserData {
  uid?: string;
  internalId: string; // 고유 식별자 (문서 ID)
  userId: string; // 학번 또는 교번 (로그인 아이디)
  previousUserIds?: string[]; // 아이디 변경 이력
  userType: 'S' | 'T';
  name: string;
  role: 'student' | 'teacher' | 'admin';
  schoolYear?: string; // 현재 학년도 (예: "2026")
  grade?: number;
  classNumber?: number;
  studentNumber?: number;
  oneTimeCode?: string;
  passwordSet: boolean;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface PostData {
  id?: string;
  title: string;
  content: string;
  category?: string;
  subCategory?: string;
  grade?: string;
  isImportant?: boolean;
  showOnMain?: boolean;
  publishStartDate?: string; // "YYYY-MM-DD"
  publishEndDate?: string;   // "YYYY-MM-DD"
  noEndDate?: boolean;
  
  // Application Board (신청형 게시판) 전용 필드
  serviceType?: 'BOARD' | 'APPLICATION' | 'CALENDAR';
  applicationStatus?: '접수' | '검토 중' | '처리 완료' | '답변 완료';
  isPrivate?: boolean;
  adminReply?: {
    content: string;
    authorName: string;
    createdAt: any;
  };

  authorId: string; // internalId
  authorUserId: string; // userId
  authorName: string;
  authorRole: 'student' | 'teacher' | 'admin';
  authorUserType: 'S' | 'T';
  createdAt: any;
  updatedAt: any;
}

export interface SystemConfig {
  maintenanceMode: boolean; // 학년도 전환 기간 등 시스템 점검 모드 (신청/수정 제한)
  readOnlyMode: boolean;
  currentSchoolYear: string;
}

export interface CalendarData {
  id?: string;
  department: string;
  date: string; // "YYYY-MM-DD"
  data: any; // 부서별 특화 데이터 (예: 식단표, 학사일정 등)
  createdAt: any;
  updatedAt: any;
}


export interface LibraryProgram {
  id?: string;
  title: string;
  applyStartDate: string; // "YYYY-MM-DD"
  applyEndDate: string;   // "YYYY-MM-DD"
  eventDate: string;
  location: string;
  targetGrade: string;
  maxParticipants: number;
  currentParticipants: number;
  content: string;
  status: '접수중' | '마감';
  authorId: string;
  authorName: string;
  createdAt: any;
  updatedAt: any;
}

export interface LibraryProgramApplication {
  id?: string;
  programId: string;
  studentId: string;
  studentUserId: string;
  studentName: string;
  studentGrade?: number;
  appliedAt: any;
}
