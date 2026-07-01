import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PasswordSetupPage from './pages/PasswordSetupPage';
import BoardPage from './pages/BoardPage';
import GradePage from './pages/GradePage';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">로딩 중...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/setup-password" element={currentUser ? <Navigate to="/" /> : <PasswordSetupPage />} />
      
      {/* Public Routes with Layout */}
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<HomePage />} />
        <Route path="board/:category/:subCategory" element={<BoardPage />} />
        <Route path="board" element={<BoardPage />} /> {/* 기본 라우트 유지 */}
        <Route path="grade/:gradeId" element={<GradePage />} />
        <Route path="grade/:gradeId/board/:subCategory" element={<BoardPage />} />
      </Route>
    </Routes>
  );
};

export default App;
