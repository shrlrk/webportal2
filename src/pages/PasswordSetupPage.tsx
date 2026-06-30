import React, { useState, useEffect, KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerWithUserIdAndPassword } from '../services/firebase/authService';
import { updateUserUidAndPasswordSet } from '../services/firebase/userService';

const PasswordSetupPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const state = location.state as { docId: string, userId: string, from?: string };

  useEffect(() => {
    if (!state?.docId || !state?.userId) {
      navigate('/login');
    }
  }, [state, navigate]);

  const checkCapsLock = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const hasLength = password.length >= 8 && password.length <= 16;
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_]/.test(password);
  
  const validCount = [hasLength, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isAllValid = validCount === 4;
  const isMatch = password.length > 0 && password === confirmPassword;
  
  let strengthLabel = '';
  let strengthColor = '';
  if (password.length === 0) {
    strengthLabel = '';
  } else if (validCount <= 1 || password.length < 4) {
    strengthLabel = '약함';
    strengthColor = 'text-red-500';
  } else if (validCount <= 3) {
    strengthLabel = '보통';
    strengthColor = 'text-yellow-500';
  } else {
    strengthLabel = '안전';
    strengthColor = 'text-green-500';
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAllValid || !isMatch) return;

    setError('');
    setLoading(true);
    try {
      const userCredential = await registerWithUserIdAndPassword(state.userId, password);
      await updateUserUidAndPasswordSet(state.docId, userCredential.user.uid);
      
      setSuccessMsg('비밀번호가 설정되었습니다.');
      
      setTimeout(() => {
        navigate('/login', { state: { from: state.from } });
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      setError('비밀번호 설정 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    checkCapsLock(e);
    if (e.key === 'Enter' && isAllValid && isMatch) {
      handleSubmit();
    }
  };

  if (!state) return null;

  const ConditionItem = ({ isValid, text }: { isValid: boolean, text: string }) => (
    <div className={`flex items-center gap-1.5 text-[13px] ${isValid ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>
      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {isValid ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[24px] shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-[24px] font-bold text-gray-800 tracking-tight">비밀번호 설정</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">새롭게 사용할 비밀번호를 입력해 주세요.</p>
        </div>

        {error && <div className="mb-6 text-[13px] text-red-500 text-center bg-red-50 py-3 rounded-xl font-medium">{error}</div>}
        {successMsg && <div className="mb-6 text-[13px] text-green-600 text-center bg-green-50 py-3 rounded-xl font-medium">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Password Input */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1 flex justify-between items-center">
              <span>새 비밀번호</span>
              {password.length > 0 && (
                <span className={`text-[12px] font-bold flex items-center gap-1 ${strengthColor}`}>
                  {strengthLabel === '약함' && '🔴 약함'}
                  {strengthLabel === '보통' && '🟡 보통'}
                  {strengthLabel === '안전' && '🟢 안전'}
                </span>
              )}
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                onKeyUp={checkCapsLock}
                onKeyDown={handleKeyDown}
                className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            
            {capsLockOn && (
              <p className="text-[12px] text-red-500 mt-2 ml-1 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Caps Lock이 켜져 있습니다.
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-1 ml-1">
              <ConditionItem isValid={hasLength} text="8~16자" />
              <ConditionItem isValid={hasLower} text="영문 소문자 포함" />
              <ConditionItem isValid={hasNumber} text="숫자 포함" />
              <ConditionItem isValid={hasSpecial} text="특수문자 포함" />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">비밀번호 확인</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                required 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyUp={checkCapsLock}
                onKeyDown={handleKeyDown}
                className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all bg-gray-50/50 text-gray-800" 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            
            {confirmPassword.length > 0 && (
              <p className={`text-[12px] mt-2 ml-1 flex items-center gap-1 font-medium ${isMatch ? 'text-blue-500' : 'text-red-500'}`}>
                {isMatch ? (
                  <>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    비밀번호가 일치합니다.
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    비밀번호가 일치하지 않습니다.
                  </>
                )}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!isAllValid || !isMatch || loading} 
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold rounded-xl mt-2 transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? '설정 중...' : '설정 완료 및 로그인'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordSetupPage;
