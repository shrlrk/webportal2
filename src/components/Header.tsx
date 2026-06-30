import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex flex-col items-start justify-center">
            <span className="text-gray-600 font-medium text-[12px] sm:text-[14px] tracking-wider mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>DY365</span>
            <h1 className="text-[28px] sm:text-[34px] font-bold text-gray-800 tracking-tight leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              학교생활<span className="text-blue-500">+</span>
            </h1>
          </div>
        </div>
        {/* Right Icons Area */}
        <nav className="flex items-center gap-5 sm:gap-6">
          <button className="flex items-center justify-center text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all" title="홈">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          </button>
          <button className="flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 p-2 rounded-full transition-all" title="알림">
            <span className="material-symbols-outlined text-[26px]">notifications</span>
          </button>
          <button className="flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 p-2 rounded-full transition-all" title="즐겨찾기">
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
                    <button onClick={() => handleMenuClick(() => navigate('/login', { state: { tab: 'verify' } }))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">최초 인증</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleMenuClick(() => alertPlaceholder('내 정보'))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">내 정보</button>
                    
                    {currentUser.role === 'student' && (
                      <button onClick={() => handleMenuClick(() => alertPlaceholder('내 신청내역'))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">내 신청내역</button>
                    )}
                    
                    {currentUser.role === 'teacher' && (
                      <>
                        <button onClick={() => handleMenuClick(() => alertPlaceholder('내가 작성한 글'))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">내가 작성한 글</button>
                        <button onClick={() => handleMenuClick(() => alertPlaceholder('신청 관리'))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">신청 관리</button>
                      </>
                    )}
                    
                    {currentUser.role === 'admin' && (
                      <>
                        <button onClick={() => handleMenuClick(() => alertPlaceholder('교사 업무'))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">교사 업무</button>
                        <button onClick={() => handleMenuClick(() => alertPlaceholder('시스템 관리'))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">시스템 관리</button>
                      </>
                    )}
                    
                    <button onClick={() => handleMenuClick(() => alertPlaceholder('즐겨찾기 목록'))} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">즐겨찾기 목록</button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleAuthAction} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">로그아웃</button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
