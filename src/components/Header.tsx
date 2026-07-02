import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import { Eye, EyeOff } from 'lucide-react';
import { changePassword } from '../services/firebase/authService';

const ConditionItem = ({ isValid, text }: { isValid: boolean, text: string }) => (
  <div className={`flex items-center gap-1.5 text-[13px] ${isValid ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>
    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
      {isValid ? 'check_circle' : 'radio_button_unchecked'}
    </span>
    <span>{text}</span>
  </div>
);

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 비밀번호 변경 모달 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthAction = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      try {
        await logout();
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
    setIsDropdownOpen(false);
  };

  const handleMenuClick = (action: () => void) => {
    setIsDropdownOpen(false);
    action();
  };

  const alertPlaceholder = (menuName: string) => {
    alert(`${menuName} 기능은 준비 중입니다.`);
  };

  // 비밀번호 조건 확인
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_]/.test(newPassword);
  
  const validCount = [hasLength, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isAllValid = validCount === 4;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('모든 항목을 입력해 주세요.');
      return;
    }
    if (!isMatch) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isAllValid) {
      alert('새 비밀번호 조건을 확인해 주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword(currentUser!.userId, currentPassword, newPassword);
      alert('비밀번호가 변경되었습니다.');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        alert('현재 비밀번호가 올바르지 않습니다.');
      } else {
        alert('오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <div className="flex flex-col items-start justify-center">
              <span className="text-gray-600 font-medium text-[12px] sm:text-[14px] tracking-wider mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>DY365</span>
              <h1 className="text-[28px] sm:text-[34px] font-bold text-gray-800 tracking-tight leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                학교생활<span className="text-blue-500">+</span>
              </h1>
            </div>
          </div>
          {/* Right Icons Area */}
          <nav className="flex items-center gap-5 sm:gap-6">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all" 
              title="홈"
            >
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            </button>
            <button className="flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 p-2 rounded-full transition-all" title="알림">
              <span className="material-symbols-outlined text-[26px]">notifications</span>
            </button>
            <button 
              onClick={() => navigate('/favorites')}
              className="flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 p-2 rounded-full transition-all" 
              title="즐겨찾기"
            >
              <span className="material-symbols-outlined text-[26px]">star</span>
            </button>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 py-1.5 px-2 rounded-full transition-all" 
                title="사용자 메뉴"
              >
                <span className="material-symbols-outlined text-[26px]">
                  person
                </span>
                {currentUser && (
                  <span className="text-blue-500 text-[10px] ml-0.5">▼</span>
                )}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                  {!currentUser ? (
                    <>
                      <button onClick={() => handleMenuClick(() => navigate('/login', { state: { tab: 'login' } }))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">로그인</button>
                    </>
                  ) : (
                    <>
                      {currentUser.userId && (
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                          <div className="text-blue-500 text-xs font-semibold">#{currentUser.userId}</div>
                        </div>
                      )}
                      <button onClick={() => handleMenuClick(() => setIsPasswordModalOpen(true))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">비밀번호 변경</button>
                      <button onClick={() => handleMenuClick(() => alertPlaceholder('내가 작성한 글'))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">내가 작성한 글</button>
                      <button onClick={() => handleMenuClick(() => alertPlaceholder('신청관리'))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">신청관리</button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleAuthAction} className="w-full text-left px-4 py-2.5 text-sm text-blue-500 hover:bg-blue-50 transition-colors font-medium" style={{ color: '#3b82f6' }}>로그아웃</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <Modal 
        isOpen={isPasswordModalOpen} 
        title="비밀번호 변경" 
        onClose={() => {
          setIsPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}
      >
        <div className="flex flex-col gap-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">현재 비밀번호</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800"
              />
              <button 
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">{showCurrentPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">새 비밀번호</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800"
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-1 ml-1">
              <ConditionItem isValid={hasLength} text="8~16자" />
              <ConditionItem isValid={hasLower} text="영문 소문자 포함" />
              <ConditionItem isValid={hasNumber} text="숫자 포함" />
              <ConditionItem isValid={hasSpecial} text="특수문자 포함" />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">새 비밀번호 확인</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            
            {confirmPassword.length > 0 && (
              <p className={`text-[12px] mt-2 ml-1 flex items-center gap-1 font-medium ${isMatch ? 'text-blue-500' : 'text-red-500'}`}>
                {isMatch ? (
                  <>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    비밀번호가 일치합니다.
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    비밀번호가 일치하지 않습니다.
                  </>
                )}
              </p>
            )}
          </div>

          <button 
            onClick={handlePasswordChange}
            disabled={!isAllValid || !isMatch || isSubmitting}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold rounded-xl mt-2 transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Header;
