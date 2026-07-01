import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Languages, Calculator, Globe, FlaskConical, Palette, 
  Music, Dumbbell, Monitor, Wrench, ScrollText,
  CircleDot, Compass, GraduationCap, MessageCircle, Folder,
  HeartHandshake, Stethoscope, Library, Utensils, Megaphone 
} from 'lucide-react';
import { getPosts } from '../services/firebase/boardService';
import { PostData } from '../types';

const HomePage: React.FC = () => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [mainNotices, setMainNotices] = useState<PostData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPosts(undefined, undefined, undefined, true).then(setMainNotices);
  }, []);

  const menus = [
    { 
      id: 1, 
      title: '교과', 
      icon: 'menu_book', 
      path: '/board',
      submenus: [
        { title: '국어', icon: BookOpen, path: '/board/subject/korean' },
        { title: '영어', icon: Languages, path: '/board/subject/english' },
        { title: '수학', icon: Calculator, path: '/board/subject/math' },
        { title: '음악', icon: Music, path: '/board/subject/music' },
        { title: '체육', icon: Dumbbell, path: '/board/subject/pe' },
        { title: '사회', icon: Globe, path: '/board/subject/social' },
        { title: '과학', icon: FlaskConical, path: '/board/subject/science' },
        { title: '외국어', icon: Languages, path: '/board/subject/foreign' },
        { title: '정보', icon: Monitor, path: '/board/subject/it' },
        { title: '기술가정', icon: Wrench, path: '/board/subject/tech' },
        { title: '한문', icon: ScrollText, path: '/board/subject/hanja' },
      ]
    },
    { 
      id: 2, 
      title: '학년', 
      icon: 'groups', 
      path: '/board',
      submenus: [
        { title: '1학년', icon: CircleDot, path: '/board/grade/1' },
        { title: '2학년', icon: CircleDot, path: '/board/grade/2' },
        { title: '3학년', icon: CircleDot, path: '/board/grade/3' },
      ]
    },
    { 
      id: 3, 
      title: '진로', 
      icon: 'explore', 
      path: '/board',
      submenus: [
        { title: '진로정보', icon: Compass, path: '/board/career/info' },
        { title: '대학정보', icon: GraduationCap, path: '/board/career/university' },
        { title: '학과정보', icon: BookOpen, path: '/board/career/department' },
        { title: '상담신청', icon: MessageCircle, path: '/board/career/counseling' },
        { title: '자료실', icon: Folder, path: '/board/career/resources' },
      ]
    },
    { 
      id: 4, 
      title: '학생지원', 
      icon: 'school', 
      path: '/board',
      submenus: [
        { title: 'Wee클래스', icon: HeartHandshake, path: '/board/support/wee' },
        { title: '보건실', icon: Stethoscope, path: '/board/support/health' },
        { title: '꿈마루도서관', icon: Library, path: '/board/support/library' },
        { title: '학생식당', icon: Utensils, path: '/board/support/cafeteria' },
      ]
    }
  ];

  const getGridCols = (length: number) => {
    if (length >= 6) return 'md:grid-cols-6';
    if (length === 5) return 'md:grid-cols-5';
    if (length === 4) return 'md:grid-cols-4';
    if (length === 3) return 'md:grid-cols-3';
    return 'md:grid-cols-4';
  };

  const handleMenuClick = (id: number) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const activeMenu = menus.find(m => m.id === activeMenuId);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col items-center flex-grow">
      
      {/* Search Bar Section */}
      <div className="w-full max-w-2xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4">
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

      {/* Main Notice Section */}
      {mainNotices.length > 0 && (
        <div className="w-full max-w-4xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 ml-1">
              <Megaphone className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">주요 공지사항</h3>
            </div>
            <div className="flex flex-col gap-2">
              {mainNotices.map((notice) => (
                <div key={notice.id} className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <span className="text-gray-700 font-medium line-clamp-1">
                    {notice.title}
                  </span>
                  <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                    {notice.createdAt?.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Menus */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => handleMenuClick(menu.id)}
            className={`flex flex-col items-center justify-center bg-white border rounded-2xl p-6 md:p-8 hover:shadow-md transition-all duration-300 group ${
              activeMenuId === menu.id 
                ? 'border-blue-500 ring-2 ring-blue-50 shadow-sm transform -translate-y-1' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-110 ${
              activeMenuId === menu.id ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-600'
            }`}>
              <span className="material-symbols-outlined text-3xl">{menu.icon}</span>
            </div>
            <span className={`text-base md:text-lg font-semibold ${
              activeMenuId === menu.id ? 'text-blue-600' : 'text-gray-700'
            }`}>{menu.title}</span>
          </button>
        ))}
      </div>

      {/* Submenus Area */}
      {activeMenu && (
        <div className="w-full max-w-4xl mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className={`grid grid-cols-2 ${getGridCols(activeMenu.submenus.length)} gap-3 sm:gap-4`}>
              {activeMenu.submenus.map((sub, idx) => {
                const Icon = sub.icon;
                return (
                  <button 
                    key={idx}
                    onClick={() => navigate(sub.path)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group min-h-[100px]"
                  >
                    <Icon className="w-6 h-6 text-gray-500 mb-2 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
                    <span className="text-[13px] sm:text-sm font-medium text-gray-700 group-hover:text-gray-900 break-keep">{sub.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
