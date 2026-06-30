import React, { useState } from 'react';
import Modal from './Modal';
import termsRaw from '../../terms.md?raw';
import privacyRaw from '../../privacy.md?raw';

const Footer: React.FC = () => {
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: ''
  });

  const openModal = (title: string, content: string) => {
    setModalConfig({ isOpen: true, title, content });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // 기존 HTML에서 사용하던 마크다운 변환 로직
  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mb-6">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\n/gim, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <>
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="font-medium">
            © 2026 대영고등학교 | Developed by 이순옥
          </div>
          <div className="flex items-center gap-6">
            <button className="hover:text-gray-800 transition-colors">문의하기</button>
            <button onClick={() => openModal('이용약관', termsRaw)} className="hover:text-gray-800 transition-colors">이용약관</button>
            <button onClick={() => openModal('개인정보처리방침', privacyRaw)} className="hover:text-gray-800 transition-colors font-medium">개인정보처리방침</button>
            <button className="hover:text-gray-800 transition-colors">시스템관리</button>
          </div>
        </div>
      </footer>

      <Modal isOpen={modalConfig.isOpen} title={modalConfig.title} onClose={closeModal}>
        {renderMarkdown(modalConfig.content)}
      </Modal>
    </>
  );
};

export default Footer;
