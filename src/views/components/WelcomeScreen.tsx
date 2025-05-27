import React, { useState } from 'react';
import { BookOpen, Users, GraduationCap, Sparkles } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { JoinClassModal } from './JoinClassModal';

interface WelcomeScreenProps {
  onTeacherLogin: () => void;
  onStudentJoin: (classCode: string, studentName?: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onTeacherLogin,
  onStudentJoin,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'>
      {/* 배경 장식 */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse'></div>
        <div className='absolute top-40 right-32 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000'></div>
        <div className='absolute bottom-32 left-1/4 w-40 h-40 bg-pink-200 rounded-full opacity-20 animate-pulse delay-2000'></div>
        <div className='absolute bottom-20 right-20 w-28 h-28 bg-yellow-200 rounded-full opacity-20 animate-pulse delay-3000'></div>
      </div>

      <div className='relative z-10 flex flex-col items-center justify-center min-h-screen p-4'>
        {/* 메인 타이틀 */}
        <div className='text-center mb-12'>
          <div className='flex items-center justify-center gap-3 mb-6'>
            <div className='relative'>
              <BookOpen size={48} className='text-blue-600' />
              <Sparkles
                size={20}
                className='absolute -top-2 -right-2 text-yellow-500 animate-spin'
              />
            </div>
            <div className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
              과학 탐구 여행
            </div>
          </div>

          <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-4'>
            AI와 함께하는 나만의 과학 탐구 여행
          </h1>

          <p className='text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed'>
            호기심을 탐구로, 질문을 발견으로 바꾸는 특별한 여행을 시작해보세요.
            <br />
            AI 친구와 함께 과학자처럼 생각하고 실험하며 성장하는 경험을
            만들어가요!
          </p>
        </div>

        {/* 특징 소개 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl'>
          <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
              <BookOpen className='text-blue-600' size={24} />
            </div>
            <h3 className='font-semibold text-gray-800 mb-2'>체계적 탐구</h3>
            <p className='text-gray-600 text-sm'>
              6단계 과학 탐구 과정을 통해 논리적 사고력을 키워요
            </p>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow'>
            <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4'>
              <Sparkles className='text-purple-600' size={24} />
            </div>
            <h3 className='font-semibold text-gray-800 mb-2'>AI 학습 도우미</h3>
            <p className='text-gray-600 text-sm'>
              개인 맞춤형 피드백과 조언으로 탐구를 도와줘요
            </p>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow'>
            <div className='w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4'>
              <Users className='text-pink-600' size={24} />
            </div>
            <h3 className='font-semibold text-gray-800 mb-2'>실시간 협업</h3>
            <p className='text-gray-600 text-sm'>
              친구들과 함께 실시간으로 탐구 과정을 공유해요
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className='flex flex-col sm:flex-row gap-4 mb-8'>
          <button
            onClick={() => setShowLoginModal(true)}
            className='flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200'
          >
            <GraduationCap size={24} />
            선생님으로 로그인
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className='flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200'
          >
            <Users size={24} />
            수업 참여하기
          </button>
        </div>

        {/* 부가 정보 */}
        <div className='text-center text-gray-500 text-sm max-w-lg'>
          <p>선생님은 로그인하여 수업을 만들고 관리할 수 있어요.</p>
          <p>학생들은 선생님이 알려준 수업 코드로 바로 참여할 수 있어요.</p>
        </div>
      </div>

      {/* 모달들 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={onTeacherLogin}
      />

      <JoinClassModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={onStudentJoin}
      />
    </div>
  );
};
