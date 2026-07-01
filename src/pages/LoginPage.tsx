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
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Verify State
  const [verifyId, setVerifyId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifyStep, setVerifyStep] = useState<1 | 2>(1);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [verifyDocId, setVerifyDocId] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifyName, setVerifyName] = useState('');
  const [expectedName, setExpectedName] = useState('');
  
  const [idError, setIdError] = useState('');
  const [nameError, setNameError] = useState('');
  const [codeError, setCodeError] = useState('');
  
  const [error, setError] = useState('');
  const [showLoginHelp, setShowLoginHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowLoginHelp(false);
    setLoading(true);
    try {
      const trimmedId = loginId.trim();
      const result = await getUserByUserId(trimmedId);

      if (!result) {
        setError('등록되지 않은 아이디입니다.');
        setLoading(false);
        return;
      }

      if (result.data.passwordSet !== true) {
        setError('최초 인증이 필요합니다.\n처음 이용하시는 경우 최초 인증을 먼저 진행해 주세요.');
        setLoading(false);
        return;
      }

      await loginWithUserIdAndPassword(trimmedId, loginPassword);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('아이디 또는 비밀번호를 다시 확인해 주세요.');
      setShowLoginHelp(true);
    }
    setLoading(false);
  };

  const handleVerifyStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIdError('');
    setNameError('');
    setCodeError('');
    setLoading(true);
    try {
      const trimmedId = verifyId.trim();
      const trimmedName = verifyName.trim();
      const trimmedCode = verifyCode.trim().toLowerCase();

      const result = await getUserByUserId(trimmedId);
      
      if (!result) {
        setIdError('등록되지 않은 아이디입니다.');
        setLoading(false);
        return;
      }

      const data = result.data;
      if (data.passwordSet === true) {
        setAlreadyVerified(true);
      } else {
        const dbName = (data.name || '').trim();
        const dbCode = (data.oneTimeCode || '').trim().toLowerCase();
        
        let hasError = false;

        if (trimmedName !== dbName) {
           setNameError('성명이 일치하지 않습니다.');
           hasError = true;
        }

        if (trimmedCode !== dbCode) {
           setCodeError('초기 인증번호가 일치하지 않습니다.');
           hasError = true;
        }

        if (hasError) {
           setLoading(false);
           return;
        }

        setVerifyDocId(result.id);
        setExpectedName(data.name || '');
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
    
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    const allowedSpecials = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?~";
    const hasSpecial = [...newPassword].some(char => allowedSpecials.includes(char));
    
    // 허용된 문자(소문자, 숫자, 지정된 특수문자)외의 문자가 하나라도 있는지 검사 (한글, 대문자, 이모지 등 차단)
    const hasInvalidChar = [...newPassword].some(char => 
      !/[a-z0-9]/.test(char) && !allowedSpecials.includes(char)
    );
    
    if (!hasLength || !hasLowercase || !hasNumber || !hasSpecial) {
      setError('비밀번호 조건을 모두 만족해야 합니다.');
      return;
    }

    if (hasInvalidChar) {
      setError('비밀번호는 영문 소문자, 숫자, 허용된 특수문자만 사용할 수 있습니다. (한글, 대문자 등 불가)');
      return;
    }

    setLoading(true);
    try {
      // 계정 생성
      const userCredential = await registerWithUserIdAndPassword(verifyId, newPassword);
      
      // DB 업데이트
      await completeUserVerification(verifyDocId, userCredential.user.uid);
      
      alert('인증이 완료되었습니다.\n학교생활+에 오신 것을 환영합니다.');
      
      // 자동 로그인 상태이므로 메인(또는 원래 요청했던) 화면으로 이동
      navigate(from, { replace: true });
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
          <div className={`mb-6 text-[13px] py-3 px-4 rounded-xl font-medium leading-relaxed whitespace-pre-wrap ${
            tab === 'login' ? 'bg-gray-50 text-gray-600 text-left' : 'bg-red-50 text-red-500 text-center'
          }`}>
            <p>{error}</p>
            {tab === 'login' && showLoginHelp && (
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
              <div className="relative">
                <input 
                  type={showLoginPassword ? 'text' : 'password'} 
                  required 
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none flex items-center justify-center"
                  tabIndex={-1}
                  aria-label={showLoginPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  <span className="material-symbols-outlined text-[20px]">{showLoginPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
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
            <div className="text-[13px] text-gray-600 text-left bg-gray-50 py-3 px-4 rounded-xl font-medium whitespace-pre-wrap leading-relaxed mb-2">
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
              <input type="text" required value={verifyId} onChange={e => { setVerifyId(e.target.value); setIdError(''); }} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" placeholder="학번 또는 교직원 ID" />
              {idError ? (
                <div className="mt-2 text-[12px] text-gray-600 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>{idError}</span>
                </div>
              ) : (
                <p className="text-[12px] text-gray-500 mt-1.5 ml-1 text-left">학생은 학번, 교사는 교번을 입력하세요.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">성명</label>
              <input type="text" required value={verifyName} onChange={e => { setVerifyName(e.target.value); setNameError(''); }} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" placeholder="이름을 입력하세요" />
              {nameError && (
                <div className="mt-2 text-[12px] text-gray-600 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>{nameError}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">초기 인증번호</label>
              <input type="text" required value={verifyCode} onChange={e => { setVerifyCode(e.target.value); setCodeError(''); }} className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" placeholder="인증번호를 입력하세요" />
              {codeError && (
                <div className="mt-2 text-[12px] text-gray-600 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>{codeError}</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-gray-800 hover:bg-gray-900 active:scale-[0.98] text-white font-semibold rounded-xl mt-4 transition-all duration-200 disabled:opacity-50">
              {loading ? '확인 중...' : '본인 확인'}
            </button>
            <div className="mt-4 text-center text-[13px] text-gray-600">
              이미 인증을 완료했나요? <button type="button" onClick={() => { setTab('login'); setError(''); }} className="text-blue-500 font-semibold hover:underline ml-1">로그인으로 돌아가기</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyStep2} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">최초 인증</h2>
            <p className="text-[13px] text-gray-600 font-medium mb-2 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
              본인 확인이 완료되었습니다.{'\n'}새 비밀번호를 설정해 주세요.
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">아이디</label>
              <input type="text" disabled value={verifyId} className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">성명</label>
              <input type="text" disabled value={verifyName} className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">새 비밀번호</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? 'text' : 'password'} 
                  required 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none flex items-center justify-center"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">{showNewPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              <div className="mt-2 flex flex-col gap-1 ml-1 text-[12px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className={newPassword.length >= 8 && newPassword.length <= 16 ? "text-blue-500 font-bold" : "text-gray-400"}>
                    {newPassword.length >= 8 && newPassword.length <= 16 ? "☑" : "☐"}
                  </span>
                  <span>8~16자리</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={/[a-z]/.test(newPassword) ? "text-blue-500 font-bold" : "text-gray-400"}>
                    {/[a-z]/.test(newPassword) ? "☑" : "☐"}
                  </span>
                  <span>영문 소문자 포함</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={/[0-9]/.test(newPassword) ? "text-blue-500 font-bold" : "text-gray-400"}>
                    {/[0-9]/.test(newPassword) ? "☑" : "☐"}
                  </span>
                  <span>숫자 포함</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={[...newPassword].some(char => "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?~".includes(char)) ? "text-blue-500 font-bold" : "text-gray-400"}>
                    {[...newPassword].some(char => "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?~".includes(char)) ? "☑" : "☐"}
                  </span>
                  <span>특수문자 포함</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">새 비밀번호 확인</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  required 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none flex items-center justify-center"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div className="mt-2 text-[12px] text-gray-600 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white">
                  {newPassword === confirmPassword ? (
                    <>
                      <span className="text-blue-500 font-bold">☑</span>
                      <span>비밀번호가 일치합니다.</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400 font-bold">✕</span>
                      <span>비밀번호가 일치하지 않습니다.</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-gray-800 hover:bg-gray-900 active:scale-[0.98] text-white font-semibold rounded-xl mt-4 transition-all duration-200 disabled:opacity-50">
              {loading ? '인증 중...' : '최초 인증 완료'}
            </button>
            <div className="mt-4 text-center text-[13px] text-gray-600">
              <button type="button" onClick={() => { setVerifyStep(1); setError(''); }} className="text-gray-500 font-medium hover:underline">이전 단계로 돌아가기</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
