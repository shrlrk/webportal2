import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900 selection:bg-blue-100 pb-16 sm:pb-20">
      <Header />
      <main className="flex-grow flex flex-col w-full relative">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Layout;
