import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserByUserId } from '../services/firebase/userService';
import { loginWithUserIdAndPassword } from '../services/firebase/authService';

const LoginPage: React.FC = () => {
  const location = useLocation();
  const initialTab = location.state?.tab === 'verify' ? 'verify' : 'login';
  const [tab, setTab] = useState<'login' | 'verify'>(initialTab);

  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab === 'verify' ? 'verify' : 'login');
    }
  }, [location.state?.tab]);
  
  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Verify State
  const [verifyId, setVerifyId] = useState('');
  const [verifyName, setVerifyName] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithUserIdAndPassword(loginId, loginPassword);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('아이디 또는 비밀번호를 확인해 주세요.\n로그인이 계속되지 않으면 담임교사 또는 도서관 담당자에게 문의하세요.');
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await getUserByUserId(verifyId);
      
      if (!result) {
        console.log('=== 최초 인증 디버깅 ===');
        console.log(`입력한 아이디: ${verifyId}`);
        console.log(`조회한 문서 존재 여부: 존재하지 않음 (해당 userId를 가진 문서 없음)`);
        console.log('=======================');
        setError('등록된 정보가 없습니다.');
        setLoading(false);
        return;
      }

      const data = result.data;
      const isNameMatch = data.name === verifyName;
      const isCodeMatch = data.oneTimeCode === verifyCode;
      
      const isFinalValid = isNameMatch && isCodeMatch && data.isActive === true && data.passwordSet === false;

      console.log('=== 최초 인증 디버깅 ===');
      console.log(`입력 userId: ${verifyId}`);
      console.log(`userId 조회 결과: 1개`);
      console.log(`문서 ID: ${result.id}`);
      console.log(`저장된 name: ${data.name} / 비교: ${isNameMatch}`);
      console.log(`저장된 oneTimeCode: ${data.oneTimeCode} / 비교: ${isCodeMatch}`);
      console.log(`isActive: ${data.isActive}`);
      console.log(`passwordSet: ${data.passwordSet}`);
      console.log(`최종 인증 가능 여부: ${isFinalValid}`);
      console.log('=======================');

      if (data.passwordSet === true) {
        setError('이미 비밀번호가 설정된 계정입니다. 로그인 탭을 이용해 주세요.');
        setLoading(false);
        return;
      }

      if (data.isActive !== true) {
        setError('비활성화된 계정입니다.');
        setLoading(false);
        return;
      }
      
      if (!isNameMatch) {
        setError('이름이 일치하지 않습니다.');
        setLoading(false);
        return;
      }
      
      if (!isCodeMatch) {
        setError('인증번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }
      
      // 성공 시 상태 넘겨주며 페이지 이동
      navigate('/setup-password', { state: { docId: result.id, userId: verifyId, from } });
    } catch (err: any) {
      setError('인증 처리 중 오류가 발생했습니다. (서버 연결 실패)');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <span className="text-gray-500 font-medium text-[13px] tracking-wider mb-1 block" style={{ fontFamily: "'Inter', sans-serif" }}>DY365</span>
          <h1 className="text-[32px] font-bold text-gray-800 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            학교생활<span className="text-blue-500">+</span>
          </h1>
        </div>

        <div className="flex mb-8 border-b border-gray-200">
          <button 
            className={`flex-1 pb-3 text-center font-semibold text-sm transition-colors ${tab === 'login' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            로그인
          </button>
          <button 
            className={`flex-1 pb-3 text-center font-semibold text-sm transition-colors ${tab === 'verify' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => { setTab('verify'); setError(''); }}
          >
            최초 인증
          </button>
        </div>

        {error && (
          <div className="mb-6 text-[13px] text-red-500 text-center bg-red-50 py-3 px-4 rounded-xl font-medium whitespace-pre-wrap leading-relaxed">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">아이디</label>
              <input type="text" required value={loginId} onChange={e => setLoginId(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
              <p className="text-[12px] text-gray-500 mt-1.5 ml-1 text-left">학생은 학번, 교사는 교번을 입력하세요.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">비밀번호</label>
              <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold rounded-xl mt-4 transition-all duration-200 disabled:opacity-50">
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">아이디</label>
              <input type="text" required value={verifyId} onChange={e => setVerifyId(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
              <p className="text-[12px] text-gray-500 mt-1.5 ml-1 text-left">학생은 학번, 교사는 교번을 입력하세요.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">이름</label>
              <input type="text" required value={verifyName} onChange={e => setVerifyName(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">1회 인증번호</label>
              <input type="text" required value={verifyCode} onChange={e => setVerifyCode(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-gray-800 hover:bg-gray-900 active:scale-[0.98] text-white font-semibold rounded-xl mt-4 transition-all duration-200 disabled:opacity-50">
              {loading ? '인증 중...' : '인증 후 비밀번호 설정'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
