export interface UserData {
  uid?: string;
  userId: string; // 학번 또는 교번
  userType: 'S' | 'T';
  name: string;
  role: 'student' | 'teacher' | 'admin';
  grade?: number;
  classNumber?: number;
  studentNumber?: number;
  oneTimeCode?: string;
  passwordSet: boolean;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}
