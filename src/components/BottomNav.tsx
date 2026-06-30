import React from 'react';

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-md mx-auto flex justify-between items-center h-16 sm:h-20 px-6">
        
        {/* 홈 */}
        <button className="flex flex-col items-center justify-center gap-1 text-blue-500 transition-colors w-16 group">
          <span className="material-symbols-outlined text-[28px] sm:text-[32px] group-active:scale-95 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          <span className="text-[10px] font-medium">홈</span>
        </button>

        {/* 알림 */}
        <button className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-800 transition-colors w-16 group">
          <span className="material-symbols-outlined text-[26px] sm:text-[28px] group-active:scale-95 transition-transform">notifications</span>
          <span className="text-[10px] font-medium">알림</span>
        </button>

        {/* 즐겨찾기 */}
        <button className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-800 transition-colors w-16 group">
          <span className="material-symbols-outlined text-[26px] sm:text-[28px] group-active:scale-95 transition-transform">star</span>
          <span className="text-[10px] font-medium">즐겨찾기</span>
        </button>

        {/* 내정보 */}
        <button className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-800 transition-colors w-16 group">
          <span className="material-symbols-outlined text-[26px] sm:text-[28px] group-active:scale-95 transition-transform">person</span>
          <span className="text-[10px] font-medium">내정보</span>
        </button>
        
      </div>
    </nav>
  );
};

export default BottomNav;
