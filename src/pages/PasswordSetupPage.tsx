import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerWithUserIdAndPassword } from '../services/firebase/authService';
import { updateUserUidAndPasswordSet } from '../services/firebase/userService';

const PasswordSetupPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const state = location.state as { docId: string, userId: string };

  useEffect(() => {
    if (!state?.docId || !state?.userId) {
      navigate('/login');
    }
  }, [state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자리 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await registerWithUserIdAndPassword(state.userId, password);
      await updateUserUidAndPasswordSet(state.docId, userCredential.user.uid);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('비밀번호 설정 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  if (!state) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-[24px] font-bold text-gray-800 tracking-tight">비밀번호 설정</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">새롭게 사용할 비밀번호를 입력해 주세요.</p>
        </div>

        {error && <div className="mb-6 text-[13px] text-red-500 text-center bg-red-50 py-3 rounded-xl font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">새 비밀번호</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" placeholder="6자리 이상" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">비밀번호 확인</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
          </div>
          <button type="submit" disabled={loading} className="w-full h-12 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold rounded-xl mt-6 transition-all duration-200 disabled:opacity-50">
            {loading ? '설정 중...' : '설정 완료 및 로그인'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordSetupPage;
