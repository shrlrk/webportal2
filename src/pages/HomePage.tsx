import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const menus = [
    { id: 1, title: '교과', icon: 'menu_book', path: '/board' },
    { id: 2, title: '학년', icon: 'groups', path: '/board' },
    { id: 3, title: '진로', icon: 'explore', path: '/board' },
    { id: 4, title: '학생지원', icon: 'school', path: '/board' }
  ];

  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col items-center flex-grow">
      
      {/* Search Bar Section */}
      <div className="w-full max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4">
        <div className="relative group flex items-center">
          <div className="absolute left-5 flex items-center justify-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-500 transition-colors text-2xl">search</span>
          </div>
          <input 
            type="text" 
            className="w-full h-14 sm:h-16 pl-14 pr-24 rounded-full bg-white border border-gray-200 outline-none transition-all duration-300 text-base sm:text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm hover:shadow"
          />
          <button className="absolute right-2 h-10 sm:h-12 px-5 sm:px-6 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-semibold rounded-full transition-all duration-200 text-sm shadow-sm flex items-center justify-center">
            검색
          </button>
        </div>
      </div>

      {/* Main Menus */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => navigate(menu.path)}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-6 md:p-8 hover:shadow-md hover:border-gray-300 transition-all duration-300 group"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-50 border border-gray-100 transition-transform duration-300 group-hover:scale-110">
              <span className="material-symbols-outlined text-3xl text-gray-600">{menu.icon}</span>
            </div>
            <span className="text-base md:text-lg font-semibold text-gray-700">{menu.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
