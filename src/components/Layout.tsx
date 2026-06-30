import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] font-sans text-gray-900 selection:bg-blue-100">
      <Header />
      <main className="flex-grow flex flex-col w-full relative">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
