import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PasswordSetupPage from './pages/PasswordSetupPage';
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
      
      {/* Protected Route */}
      <Route path="/" element={
        currentUser ? (
          <Layout>
            <HomePage />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />
    </Routes>
  );
};

export default App;
