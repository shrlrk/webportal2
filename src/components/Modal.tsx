import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  // 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 모달 닫힘 방지
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-gray-700 text-sm leading-relaxed custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
