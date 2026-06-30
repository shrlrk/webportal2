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
