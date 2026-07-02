import React, { ReactNode } from 'react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BoardLayoutProps {
  title: string;
  breadcrumb: string;
  onGoBack?: () => void;
  showSearch?: boolean;
  searchKeyword?: string;
  onSearchChange?: (val: string) => void;
  showWriteButton?: boolean;
  onWriteClick?: () => void;
  children: ReactNode;
  narrow?: boolean; // 글 작성/상세보기용 좁은 폭
  topContent?: ReactNode; // 상단 탭 메뉴 등을 위한 공간
}

const BoardLayout: React.FC<BoardLayoutProps> = ({
  title,
  breadcrumb,
  onGoBack,
  showSearch = false,
  searchKeyword = '',
  onSearchChange,
  showWriteButton = false,
  onWriteClick,
  children,
  narrow = false,
  topContent
}) => {
  const navigate = useNavigate();
  const maxWidthClass = narrow ? 'max-w-4xl' : 'max-w-5xl';

  return (
    <div className={`w-full ${maxWidthClass} mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col flex-grow animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      
      {topContent && (
        <div className="mb-6">
          {topContent}
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          {onGoBack && (
            <button onClick={onGoBack} className="mr-4 text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="text-sm font-medium text-gray-400 mb-1">{breadcrumb}</div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {title}
            </h2>
          </div>
        </div>
        
        {showWriteButton && onWriteClick && (
          <button 
            onClick={onWriteClick}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            새 글 작성
          </button>
        )}
      </div>

      {/* Search Area */}
      {showSearch && onSearchChange && (
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="제목이나 내용으로 검색하세요..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
          />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-grow flex flex-col">
        {children}
      </div>

    </div>
  );
};

export default BoardLayout;
