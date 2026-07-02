import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SUPPORT_MENUS } from '../constants/serviceMenus';
import BoardPage from './BoardPage';
import ApplicationBoard from '../components/ApplicationBoard/ApplicationBoard';
import CalendarService from '../components/CalendarService/CalendarService';

const SupportDepartmentPage: React.FC = () => {
  const { department } = useParams();
  const navigate = useNavigate();
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

  const renderTabs = () => (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{config.title}</h1>
      <div className="flex overflow-x-auto border-b border-gray-200 gap-6 hide-scrollbar">
        {config.menus.map(menu => (
          <button
            key={menu.id}
            onClick={() => setActiveTab(menu.id)}
            className={`whitespace-nowrap py-3 font-semibold text-[15px] sm:text-base border-b-2 transition-colors duration-300 px-1 ${
              activeTab === menu.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {menu.title}
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMenu.type) {
      case 'BOARD':
        return (
          <BoardPage 
            category="support" 
            subCategory={activeMenu.id} 
            topContent={renderTabs()} 
          />
        );
      case 'APPLICATION':
        return <ApplicationBoard department={department!} subCategory={activeMenu.id} topContent={renderTabs()} />;
      case 'CALENDAR':
        return <CalendarService department={department!} subCategory={activeMenu.id} topContent={renderTabs()} />;
      default:
        return <div>준비 중입니다.</div>;
    }
  };

  return renderContent();
};

export default SupportDepartmentPage;
