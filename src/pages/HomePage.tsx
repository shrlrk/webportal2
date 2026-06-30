import React from 'react';

const HomePage: React.FC = () => {
  const menus = [
    { id: 1, title: '교과', icon: 'menu_book', color: 'text-blue-500 bg-blue-50 border-blue-100 hover:border-blue-300' },
    { id: 2, title: '학년', icon: 'groups', color: 'text-green-500 bg-green-50 border-green-100 hover:border-green-300' },
    { id: 3, title: '진로', icon: 'explore', color: 'text-purple-500 bg-purple-50 border-purple-100 hover:border-purple-300' },
    { id: 4, title: '학생지원', icon: 'school', color: 'text-orange-500 bg-orange-50 border-orange-100 hover:border-orange-300' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center flex-grow">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">환영합니다!</h2>
        <p className="text-gray-500 text-base md:text-lg">대영고등학교 스마트 포털에서 필요한 메뉴를 선택해 주세요.</p>
      </div>

      {/* Main Menus */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
        {menus.map((menu) => (
          <button
            key={menu.id}
            className={`flex flex-col items-center justify-center bg-white border rounded-2xl p-6 md:p-8 hover:shadow-lg transition-all duration-300 group ${menu.color}`}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
              <span className="material-symbols-outlined text-3xl">{menu.icon}</span>
            </div>
            <span className="text-base md:text-lg font-semibold text-gray-800">{menu.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
