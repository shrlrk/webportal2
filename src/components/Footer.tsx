import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <div className="font-medium">
          © 2026 대영고등학교 | Developed by 학교생활+ 팀
        </div>
        <div className="flex items-center gap-6">
          <button className="hover:text-gray-800 transition-colors">이용약관</button>
          <button className="hover:text-gray-800 font-medium transition-colors">개인정보처리방침</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
