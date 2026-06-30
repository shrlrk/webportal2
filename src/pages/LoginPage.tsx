import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserByUserId, completeUserVerification } from '../services/firebase/userService';
import { loginWithUserIdAndPassword, registerWithUserIdAndPassword } from '../services/firebase/authService';

const SYSTEM_SETTINGS_PLACEHOLDER = {
  loginHelp: {
    title: "비밀번호를 잊으셨나요?",
    adminDepartment: "도서관" // 추후 시스템 관리 > 환경설정에서 변경 가능한 값
  }
};

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
  const [verifyCode, setVerifyCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifyStep, setVerifyStep] = useState<1 | 2>(1);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [verifyDocId, setVerifyDocId] = useState('');
  
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
      setError('아이디 또는 비밀번호를 다시 확인해 주세요.');
    }
    setLoading(false);
  };

  const handleVerifyStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await getUserByUserId(verifyId);
      
      if (!result) {
        setError('등록되지 않은 아이디입니다.');
        setLoading(false);
        return;
      }

      const data = result.data;
      if (data.passwordSet === true || data.isActive === true) {
        setAlreadyVerified(true);
      } else {
        setVerifyDocId(result.id);
        setVerifyStep(2);
      }
    } catch (err: any) {
      setError('서버 연결에 실패했습니다.');
    }
    setLoading(false);
  };

  const handleVerifyStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await getUserByUserId(verifyId);
      if (!result) {
        setError('등록되지 않은 아이디입니다.');
        setLoading(false);
        return;
      }
      
      const data = result.data;

      if (data.oneTimeCode !== verifyCode) {
        setError('초기 인증번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setError('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError('비밀번호가 너무 짧습니다. (최소 6자리 이상)');
        setLoading(false);
        return;
      }
      
      // 계정 생성
      const userCredential = await registerWithUserIdAndPassword(verifyId, newPassword);
      
      // DB 업데이트
      await completeUserVerification(verifyDocId, userCredential.user.uid);
      
      alert('최초 인증이 완료되었습니다. 로그인해 주세요.');
      
      // 폼 초기화 및 로그인 이동
      setVerifyId('');
      setVerifyCode('');
      setNewPassword('');
      setConfirmPassword('');
      setVerifyStep(1);
      setAlreadyVerified(false);
      setTab('login');
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



        {error && (
          <div className={`mb-6 text-[13px] py-3 px-4 rounded-xl font-medium leading-relaxed ${
            tab === 'login' ? 'bg-gray-50 text-gray-600 text-left' : 'bg-red-50 text-red-500 text-center whitespace-pre-wrap'
          }`}>
            <p>{error}</p>
            {tab === 'login' && (
              <div className="mt-3 pt-3 border-t border-gray-200/60">
                <p className="font-semibold">{SYSTEM_SETTINGS_PLACEHOLDER.loginHelp.title}</p>
                <p>학교생활+ 관리자({SYSTEM_SETTINGS_PLACEHOLDER.loginHelp.adminDepartment})에게 문의하세요.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">로그인</h2>
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
            <div className="mt-4 text-center text-[13px] text-gray-600">
              처음 이용하시나요? <button type="button" onClick={() => { setTab('verify'); setError(''); setVerifyStep(1); setAlreadyVerified(false); }} className="text-blue-500 font-semibold hover:underline ml-1">최초 인증하기</button>
            </div>
          </form>
        ) : alreadyVerified ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">최초 인증</h2>
            <div className="text-[13px] text-gray-600 text-center bg-gray-50 py-3 px-4 rounded-xl font-medium whitespace-pre-wrap leading-relaxed mb-2">
              이미 최초 인증이 완료된 계정입니다.<br/>로그인으로 이용해 주세요.
            </div>
            <button type="button" onClick={() => { setTab('login'); setAlreadyVerified(false); setError(''); }} className="w-full h-12 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200">
              로그인으로 이동
            </button>
          </div>
        ) : verifyStep === 1 ? (
          <form onSubmit={handleVerifyStep1} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">최초 인증</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">아이디</label>
              <input type="text" required value={verifyId} onChange={e => setVerifyId(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
              <p className="text-[12px] text-gray-500 mt-1.5 ml-1 text-left">학생은 학번, 교사는 교번을 입력하세요.</p>
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-gray-800 hover:bg-gray-900 active:scale-[0.98] text-white font-semibold rounded-xl mt-4 transition-all duration-200 disabled:opacity-50">
              {loading ? '확인 중...' : '다음'}
            </button>
            <div className="mt-4 text-center text-[13px] text-gray-600">
              이미 인증을 완료했나요? <button type="button" onClick={() => { setTab('login'); setError(''); }} className="text-blue-500 font-semibold hover:underline ml-1">로그인으로 돌아가기</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyStep2} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">최초 인증</h2>
            <p className="text-[13px] text-gray-600 font-medium mb-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              처음 이용하는 학생과 교사는 초기 인증번호로 본인 확인 후 비밀번호를 설정하세요.
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">아이디</label>
              <input type="text" disabled value={verifyId} className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">초기 인증번호</label>
              <input type="text" required value={verifyCode} onChange={e => setVerifyCode(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">새 비밀번호</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">새 비밀번호 확인</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-gray-800 hover:bg-gray-900 active:scale-[0.98] text-white font-semibold rounded-xl mt-4 transition-all duration-200 disabled:opacity-50">
              {loading ? '인증 중...' : '최초 인증 완료'}
            </button>
            <div className="mt-4 text-center text-[13px] text-gray-600">
              이미 인증을 완료했나요? <button type="button" onClick={() => { setTab('login'); setError(''); }} className="text-blue-500 font-semibold hover:underline ml-1">로그인으로 돌아가기</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
