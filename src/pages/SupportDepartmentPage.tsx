import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SUPPORT_MENUS } from '../constants/serviceMenus';
import BoardPage from './BoardPage';
import ApplicationBoard from '../components/ApplicationBoard/ApplicationBoard';
import CalendarService from '../components/CalendarService/CalendarService';
import { useAuth } from '../contexts/AuthContext';

const SupportDepartmentPage: React.FC = () => {
  const { department } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const config = SUPPORT_MENUS[department || ''];

  const [activeTab, setActiveTab] = useState(config?.menus[0]?.id || '');

  // 의존성 배열에 config.menus[0].id를 넣으면 무한루프 위험이 있으므로 department 변경 시 초기화
  useEffect(() => {
    if (!config) {
      navigate('/');
    } else {
      setActiveTab(config.menus[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, navigate]);

  if (!config) return null;

  const activeMenu = config.menus.find(m => m.id === activeTab) || config.menus[0];

  const renderCards = () => (
    <div className="flex flex-col animate-in fade-in slide-in-from-top-4 duration-300 mb-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{config.title}</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {config.menus.map(menu => (
            <button
              key={menu.id}
              onClick={() => setActiveTab(menu.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all group min-h-[100px] ${
                activeTab === menu.id
                  ? 'border-blue-500 ring-2 ring-blue-50 bg-blue-50/20'
                  : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
              }`}
            >
              <span className={`text-[13px] sm:text-[15px] font-semibold break-keep text-center ${
                activeTab === menu.id ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
              }`}>
                {menu.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (message: string) => (
    <div>
      {renderCards()}
      <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center text-gray-500 shadow-sm">
        {message}
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeMenu.id === 'search') {
      return renderPlaceholder("도서검색 기능은 준비 중입니다.");
    }
    if (activeMenu.id === 'newbooks') {
      return renderPlaceholder("신착도서 안내 기능은 준비 중입니다.");
    }
    if (activeMenu.id === 'diet') {
      const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
      return renderPlaceholder(isTeacher ? "월간 식단 업로드 기능은 준비 중입니다." : "월간 식단 기능은 준비 중입니다.");
    }

    switch (activeMenu.type) {
      case 'BOARD':
        return (
          <BoardPage 
            category="support" 
            subCategory={activeMenu.id} 
            departmentName={config.title}
            menuTitle={activeMenu.title}
            topContent={renderCards()} 
          />
        );
      case 'APPLICATION':
        return (
          <ApplicationBoard 
            department={department!} 
            subCategory={activeMenu.id} 
            departmentName={config.title}
            menuTitle={activeMenu.title}
            topContent={renderCards()} 
          />
        );
      case 'CALENDAR':
        return <CalendarService department={department!} subCategory={activeMenu.id} topContent={renderCards()} />;
      default:
        return renderPlaceholder("준비 중입니다.");
    }
  };

  return renderContent();
};

export default SupportDepartmentPage;
