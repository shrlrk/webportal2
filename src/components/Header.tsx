import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex flex-col items-start justify-center">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span className="text-gray-400 font-normal mr-1 text-sm hidden sm:inline-block">대영고등학교</span>
              학교생활<span className="text-blue-500">+</span>
            </h1>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
