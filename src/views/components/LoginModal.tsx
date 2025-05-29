import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import type { AuthController } from '../../controllers/AuthController';

interface LoginModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
  onModeChange: (mode: 'login' | 'signup') => void;
  authController: AuthController;
}

const LoginModal: React.FC<LoginModalProps> = ({
  mode,
  onClose,
  onSuccess,
  onModeChange,
  authController,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'teacher' as 'teacher' | 'student',
    school: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 입력값 변경 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    // 회원가입 시 추가 검증
    if (mode === 'signup') {
      if (!formData.displayName) {
        newErrors.displayName = '이름을 입력해주세요.';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 로그인 처리
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const result = await authController.signIn(
        formData.email,
        formData.password
      );

      if (result.data) {
        onSuccess();
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 처리
  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const result = await authController.signUp(
        formData.email,
        formData.password,
        formData.displayName,
        'teacher',
        formData.school || undefined
      );

      if (result.data) {
        onSuccess();
      }
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
        {/* 헤더 */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                {mode === 'login' ? '로그인' : '회원가입'}
              </h2>
              <p className='text-gray-600 mt-1'>
                {mode === 'login'
                  ? '계정에 로그인하여 탐구를 시작하세요'
                  : '새 계정을 만들어 탐구 여행을 시작하세요'}
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

        {/* 폼 */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* 회원가입 시 역할 선택 */}
          {/* {mode === 'signup' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-3'>
                역할 선택
              </label>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() => handleInputChange('role', 'teacher')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    formData.role === 'teacher'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <GraduationCap className='w-8 h-8 mx-auto mb-2' />
                  <div className='font-medium'>교사</div>
                  <div className='text-xs opacity-70'>수업을 만들고 관리</div>
                </button>
                <button
                  type='button'
                  onClick={() => handleInputChange('role', 'student')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    formData.role === 'student'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Users className='w-8 h-8 mx-auto mb-2' />
                  <div className='font-medium'>학생</div>
                  <div className='text-xs opacity-70'>수업에 참여</div>
                </button>
              </div>
            </div>
          )} */}

          {/* 이름 (회원가입 시만) */}
          {mode === 'signup' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                이름
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
                  placeholder='이름을 입력하세요'
                />
              </div>
              {errors.displayName && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.displayName}
                </p>
              )}
            </div>
          )}

          {/* 이메일 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              이메일
            </label>
            <div className='relative'>
              <Mail className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type='email'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='이메일을 입력하세요'
              />
            </div>
            {errors.email && (
              <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              비밀번호
            </label>
            <div className='relative'>
              <Lock className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='비밀번호를 입력하세요'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                {showPassword ? (
                  <EyeOff className='w-5 h-5' />
                ) : (
                  <Eye className='w-5 h-5' />
                )}
              </button>
            </div>
            {errors.password && (
              <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 (회원가입 시만) */}
          {mode === 'signup' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                비밀번호 확인
              </label>
              <div className='relative'>
                <Lock className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='비밀번호를 다시 입력하세요'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* 학교명 (회원가입 시 선택사항) */}
          {mode === 'signup' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                학교명 <span className='text-gray-400 text-xs'>(선택사항)</span>
              </label>
              <input
                type='text'
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='학교명을 입력하세요'
              />
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
          >
            {isLoading ? (
              <div className='flex items-center justify-center space-x-2'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                <span>
                  {mode === 'login' ? '로그인 중...' : '계정 생성 중...'}
                </span>
              </div>
            ) : (
              <span>{mode === 'login' ? '로그인' : '계정 만들기'}</span>
            )}
          </button>

          {/* 모드 전환 */}
          <div className='text-center pt-4 border-t border-gray-200'>
            <p className='text-gray-600'>
              {mode === 'login'
                ? '계정이 없으신가요?'
                : '이미 계정이 있으신가요?'}{' '}
              <button
                type='button'
                onClick={() =>
                  onModeChange(mode === 'login' ? 'signup' : 'login')
                }
                className='text-blue-600 hover:text-blue-800 font-medium transition-colors'
              >
                {mode === 'login' ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
