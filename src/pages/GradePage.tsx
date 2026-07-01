import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Megaphone, Calendar, Folder, BookOpenCheck } from 'lucide-react';

const GradePage: React.FC = () => {
  const { gradeId } = useParams<{ gradeId: string }>();
  const navigate = useNavigate();

  const gradeName = `${gradeId}학년`;

  const menus = [
    { title: '공지사항', icon: Megaphone, path: `/board/grade/${gradeId}/notice` },
    { title: '학사일정', icon: Calendar, path: `/board/grade/${gradeId}/calendar` },
    { title: '자료실', icon: Folder, path: `/board/grade/${gradeId}/resources` },
    { title: '수강신청', icon: BookOpenCheck, path: `/board/grade/${gradeId}/enrollment` },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col items-center flex-grow">
      
      <div className="w-full max-w-4xl text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 className="text-3xl font-bold text-gray-800">{gradeName}</h2>
        <p className="text-gray-500 mt-2">공지사항, 학사일정, 자료실, 수강신청을 이용할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
        {menus.map((menu, idx) => {
          const Icon = menu.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                if (menu.title === '수강신청') {
                  alert('수강신청 기간이 아닙니다.');
                } else {
                  navigate(menu.path);
                }
              }}
              className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-6 md:p-8 hover:shadow-md hover:border-gray-300 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-blue-50/50 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-50 border border-transparent group-hover:border-blue-100">
                <Icon className="w-8 h-8 text-gray-600 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
              </div>
              <span className="text-base md:text-lg font-semibold text-gray-700">{menu.title}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default GradePage;
