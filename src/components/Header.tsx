import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (currentUser) {
      if (window.confirm('로그아웃 하시겠습니까?')) {
        try {
          await logout();
        } catch (error) {
          console.error("Logout failed", error);
        }
      }
    } else {
      navigate('/login');
    }
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
          <button 
            onClick={handleAuthAction}
            className="flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 p-2 rounded-full transition-all" 
            title={currentUser ? "로그아웃" : "로그인"}
          >
            <span className="material-symbols-outlined text-[26px]">
              {currentUser ? 'logout' : 'person'}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
