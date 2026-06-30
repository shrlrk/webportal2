import React from 'react';

const Header: React.FC = () => {
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
      </div>
    </header>
  );
};

export default Header;
