import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PasswordSetupPage from './pages/PasswordSetupPage';
import BoardPage from './pages/BoardPage';
import SupportDepartmentPage from './pages/SupportDepartmentPage';
import GradePage from './pages/GradePage';
import FavoritePage from './pages/FavoritePage';
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
        {/* 학년 관련 전용 라우트를 더 구체적이므로 먼저 선언하여 충돌 방지 */}
        <Route path="board/grade/:gradeId" element={<GradePage />} />
        <Route path="board/grade/:gradeId/:subCategory" element={<BoardPage />} />
        
        {/* 학생지원(Support) 전용 라우트 (Platform v2.0) */}
        <Route path="board/support/:department" element={<SupportDepartmentPage />} />
        
        {/* 일반 카테고리/서브카테고리 게시판 */}
        <Route path="board/:category/:subCategory" element={<BoardPage />} />
        <Route path="board" element={<BoardPage />} /> {/* 기본 라우트 유지 */}
        
        {/* 즐겨찾기 라우트 */}
        <Route path="favorites" element={<FavoritePage />} />
      </Route>
    </Routes>
  );
};

export default App;
