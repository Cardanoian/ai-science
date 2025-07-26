import React, { useState, useEffect } from 'react';
import { X, User, Building } from 'lucide-react';
import type { AuthController } from '../../controllers/AuthController';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
  authController: AuthController;
}

type AuthStep = 'google-login' | 'complete-profile';

const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onSuccess,
  authController,
}) => {
  const [authStep, setAuthStep] = useState<AuthStep>('google-login');
  const [formData, setFormData] = useState({
    displayName: '',
    school: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 인증 상태 변화 감지
  useEffect(() => {
    const unsubscribe = authController.subscribe(async (authState) => {
      if (authState.isAuthenticated && authState.user && !authState.isLoading) {
        // Google 로그인 성공 후 프로필 완성 여부 확인
        const isComplete = await authController.isProfileComplete(
          authState.user.id
        );

        if (isComplete) {
          // 프로필이 이미 완성되어 있으면 바로 성공 처리
          onSuccess();
        } else {
          // 프로필 완성이 필요하면 두 번째 단계로 이동
          setAuthStep('complete-profile');
          setIsLoading(false);
        }
      }
    });

    return unsubscribe;
  }, [authController, onSuccess]);

  // 입력값 변경 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Google 로그인 처리
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await authController.signInWithGoogle();
      // OAuth 리다이렉트가 발생하므로 여기서는 추가 처리 불필요
    } catch (error) {
      console.error('Google login failed:', error);
      setIsLoading(false);
    }
  };

  // 프로필 완성 유효성 검사
  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = '별명을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 프로필 완성 처리
  const handleCompleteProfile = async () => {
    if (!validateProfile()) return;

    const authState = authController.getState();
    if (!authState.user) return;

    try {
      setIsLoading(true);
      const result = await authController.completeTeacherProfile(
        authState.user.id,
        formData.displayName.trim(),
        formData.school.trim() || undefined
      );

      if (result.data) {
        onSuccess();
      }
    } catch (error) {
      console.error('Profile completion failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md'>
        {/* 헤더 */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                {authStep === 'google-login' ? '교사 로그인' : '프로필 완성'}
              </h2>
              <p className='text-gray-600 mt-1'>
                {authStep === 'google-login'
                  ? 'Google 계정으로 간편하게 로그인하세요'
                  : '추가 정보를 입력해서 프로필을 완성해주세요'}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <X className='w-6 h-6' />
            </button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className='p-6'>
          {authStep === 'google-login' ? (
            // Google 로그인 단계
            <div className='space-y-6'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8' viewBox='0 0 24 24'>
                    <path
                      fill='#4285F4'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='#34A853'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='#FBBC05'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='#EA4335'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                </div>
                <p className='text-gray-600 mb-6'>
                  Google 계정을 사용하여 안전하고 빠르게 로그인하세요
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className='w-full py-4 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3'
              >
                {isLoading ? (
                  <div className='flex items-center space-x-2'>
                    <div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                    <span>로그인 중...</span>
                  </div>
                ) : (
                  <>
                    <svg className='w-5 h-5' viewBox='0 0 24 24'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    <span>Google로 로그인</span>
                  </>
                )}
              </button>

              <div className='text-center text-sm text-gray-500'>
                <p>
                  로그인하면{' '}
                  <span className='text-blue-600'>서비스 이용약관</span>과{' '}
                  <span className='text-blue-600'>개인정보처리방침</span>에
                  동의하는 것으로 간주됩니다.
                </p>
              </div>
            </div>
          ) : (
            // 프로필 완성 단계
            <div className='space-y-6'>
              <div className='text-center mb-6'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <User className='w-8 h-8 text-green-600' />
                </div>
                <p className='text-gray-600'>
                  환영합니다! 마지막으로 몇 가지 정보만 더 입력해주세요.
                </p>
              </div>

              {/* 별명 입력 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  별명 <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <User className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    value={formData.displayName}
                    onChange={(e) =>
                      handleInputChange('displayName', e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.displayName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='사용하실 별명을 입력하세요'
                  />
                </div>
                {errors.displayName && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* 학교명 입력 */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  학교명{' '}
                  <span className='text-gray-400 text-xs'>(선택사항)</span>
                </label>
                <div className='relative'>
                  <Building className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    value={formData.school}
                    onChange={(e) =>
                      handleInputChange('school', e.target.value)
                    }
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                    placeholder='소속 학교명을 입력하세요'
                  />
                </div>
              </div>

              {/* 완성 버튼 */}
              <button
                onClick={handleCompleteProfile}
                disabled={isLoading}
                className='w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              >
                {isLoading ? (
                  <div className='flex items-center justify-center space-x-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span>프로필 완성 중...</span>
                  </div>
                ) : (
                  <span>시작하기</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
