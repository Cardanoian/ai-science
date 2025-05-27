import React, { useState } from 'react';
import { X, Mail, Lock, User, School, Eye, EyeOff } from 'lucide-react';
import { AuthController } from '../../controllers/AuthController';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authController] = useState(() => new AuthController());
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    school: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (isSignUp && !formData.displayName) {
      alert('이름을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const result = await authController.signUp(
          formData.email,
          formData.password,
          formData.displayName,
          'teacher'
        );

        if (result.data && !result.error) {
          alert(
            '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.'
          );
          setIsSignUp(false);
          setFormData({ email: '', password: '', displayName: '', school: '' });
        }
      } else {
        const result = await authController.signIn(
          formData.email,
          formData.password
        );

        if (result.data && !result.error) {
          onLoginSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md'>
        {/* 헤더 */}
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            {isSignUp ? '선생님 회원가입' : '선생님 로그인'}
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* 이메일 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              이메일
            </label>
            <div className='relative'>
              <Mail
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={16}
              />
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='teacher@school.ac.kr'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              비밀번호
            </label>
            <div className='relative'>
              <Lock
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={16}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                placeholder='비밀번호를 입력하세요'
                className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 회원가입 시 추가 필드 */}
          {isSignUp && (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  이름
                </label>
                <div className='relative'>
                  <User
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={16}
                  />
                  <input
                    type='text'
                    name='displayName'
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder='홍길동'
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  학교명 (선택사항)
                </label>
                <div className='relative'>
                  <School
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={16}
                  />
                  <input
                    type='text'
                    name='school'
                    value={formData.school}
                    onChange={handleInputChange}
                    placeholder='○○중학교'
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
            </>
          )}

          {/* 제출 버튼 */}
          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        {/* 회원가입/로그인 전환 */}
        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
          </p>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFormData({
                email: '',
                password: '',
                displayName: '',
                school: '',
              });
            }}
            className='text-blue-600 hover:text-blue-700 font-medium'
          >
            {isSignUp ? '로그인하기' : '회원가입하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
